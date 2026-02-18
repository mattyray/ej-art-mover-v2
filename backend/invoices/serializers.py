from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    work_order_description = serializers.CharField(
        source='work_order.job_description', read_only=True, default=None
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'client', 'client_name',
            'work_order', 'work_order_description',
            'date_created', 'amount', 'status', 'notes',
        ]
        read_only_fields = ['invoice_number']
