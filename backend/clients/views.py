from django.db.models import Count, F, Max
from rest_framework import viewsets, filters
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']

    def get_queryset(self):
        return Client.objects.annotate(
            last_activity=Max('work_orders__updated_at'),
            work_order_count=Count('work_orders'),
        ).order_by(F('last_activity').desc(nulls_last=True), 'name')
