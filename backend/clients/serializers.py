from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    work_order_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'address', 'billing_address', 'work_order_count']


class ClientListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for dropdowns / search"""

    class Meta:
        model = Client
        fields = ['id', 'name']
