from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    work_order_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'address', 'billing_address', 'work_order_count']

    def get_work_order_count(self, obj):
        return obj.work_orders.count()


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns / search"""

    class Meta:
        model = Client
        fields = ['id', 'name']
