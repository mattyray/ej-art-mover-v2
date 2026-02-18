from django.db.models import F, Max
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
            last_activity=Max('work_orders__updated_at')
        ).order_by(F('last_activity').desc(nulls_last=True), 'name')
