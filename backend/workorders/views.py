from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import WorkOrder, Event, JobAttachment, JobNote
from .serializers import (
    WorkOrderListSerializer,
    WorkOrderDetailSerializer,
    WorkOrderCreateUpdateSerializer,
    EventSerializer,
    JobAttachmentSerializer,
    JobNoteSerializer,
)


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.select_related('client').prefetch_related(
        'events', 'attachments', 'notes'
    ).order_by('-created_at')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['client__name', 'job_description']
    ordering_fields = ['created_at', 'updated_at', 'client__name', 'status', 'id']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkOrderListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return WorkOrderCreateUpdateSerializer
        return WorkOrderDetailSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        invoiced = self.request.query_params.get('invoiced')
        client_id = self.request.query_params.get('client')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if invoiced is not None:
            qs = qs.filter(invoiced=invoiced.lower() == 'true')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        work_order = self.get_object()
        work_order.status = 'completed'
        work_order.completed_at = timezone.now()
        work_order.save()
        return Response({'status': 'completed'})

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        work_order = self.get_object()
        work_order.invoiced = True
        work_order.save()
        return Response({'status': 'invoiced'})

    @action(detail=True, methods=['post'])
    def complete_and_invoice(self, request, pk=None):
        work_order = self.get_object()
        work_order.status = 'completed'
        work_order.completed_at = timezone.now()
        work_order.invoiced = True
        work_order.save()
        return Response({'status': 'completed_and_invoiced'})

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        work_order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['pending', 'in_progress', 'completed']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        work_order.status = new_status
        if new_status == 'completed':
            work_order.completed_at = timezone.now()
        work_order.save()
        return Response({'status': new_status})

    @action(detail=True, methods=['post'])
    def reset_invoiced(self, request, pk=None):
        work_order = self.get_object()
        work_order.invoiced = False
        work_order.save()
        return Response({'status': 'invoiced_reset'})


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('work_order__client').all()
    serializer_class = EventSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        work_order_id = self.request.query_params.get('work_order')
        date = self.request.query_params.get('date')
        if work_order_id:
            qs = qs.filter(work_order_id=work_order_id)
        if date:
            qs = qs.filter(date=date)
        return qs

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        event = self.get_object()
        if event.completed:
            event.completed = False
            event.completed_at = None
            event.completed_by = ''
        else:
            event.completed = True
            event.completed_at = timezone.now()
            event.completed_by = request.user.username
        event.save()

        # Recalculate work order status based on event states
        wo = event.work_order
        if not event.completed and wo.status == 'completed':
            # An event was unchecked — revert work order to in_progress
            wo.status = 'in_progress'
            wo.completed_at = None
            wo.save()
        elif event.completed and wo.events.filter(completed=False).count() == 0:
            # All events are now completed — mark work order completed
            wo.status = 'completed'
            wo.completed_at = timezone.now()
            wo.save()

        return Response({
            'completed': event.completed,
            'completed_at': event.completed_at,
            'completed_by': event.completed_by,
        })

    @action(detail=False, methods=['post'])
    def update_daily_order(self, request):
        events_data = request.data.get('events', [])
        for item in events_data:
            Event.objects.filter(id=item['id']).update(
                daily_order=item.get('daily_order'),
                scheduled_time=item.get('scheduled_time'),
            )
        return Response({'status': 'ok'})


class JobAttachmentViewSet(viewsets.ModelViewSet):
    queryset = JobAttachment.objects.select_related('work_order').all()
    serializer_class = JobAttachmentSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        work_order_id = self.request.query_params.get('work_order')
        if work_order_id:
            qs = qs.filter(work_order_id=work_order_id)
        return qs


class JobNoteViewSet(viewsets.ModelViewSet):
    queryset = JobNote.objects.select_related('work_order').order_by('-created_at')
    serializer_class = JobNoteSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        work_order_id = self.request.query_params.get('work_order')
        if work_order_id:
            qs = qs.filter(work_order_id=work_order_id)
        return qs
