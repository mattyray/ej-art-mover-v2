from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from weasyprint import HTML

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invoice_pdf(request, pk):
    invoice = get_object_or_404(
        Invoice.objects.select_related('client', 'work_order'),
        pk=pk
    )

    events = []
    if invoice.work_order:
        events = invoice.work_order.events.all().order_by('date')

    html_string = render_to_string("invoices/invoice_pdf.html", {
        "invoice": invoice,
        "events": events,
    })
    html = HTML(string=html_string)
    pdf = html.write_pdf()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'inline; filename="Invoice_{invoice.invoice_number}.pdf"'
    )
    return response
