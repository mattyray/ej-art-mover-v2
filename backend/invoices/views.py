from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('client', 'work_order').order_by('-date_created')
    serializer_class = InvoiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['client__name', 'invoice_number']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        client_id = self.request.query_params.get('client')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def perform_create(self, serializer):
        invoice = serializer.save()
        if invoice.work_order:
            invoice.work_order.invoiced = True
            invoice.work_order.save()

    @action(detail=True, methods=['post'])
    def advance_status(self, request, pk=None):
        """unpaid -> in_quickbooks -> paid"""
        invoice = self.get_object()
        if invoice.status == 'unpaid':
            invoice.status = 'in_quickbooks'
        elif invoice.status == 'in_quickbooks':
            invoice.status = 'paid'
        invoice.save()
        return Response({'status': invoice.status})

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        invoice = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['unpaid', 'in_quickbooks', 'paid']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        invoice.status = new_status
        invoice.save()
        return Response({'status': new_status})
