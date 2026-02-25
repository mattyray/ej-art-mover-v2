from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, invoice_pdf

router = DefaultRouter()
router.register(r'', InvoiceViewSet)

urlpatterns = [
    path('<int:pk>/pdf/', invoice_pdf, name='invoice-pdf'),
    path('', include(router.urls)),
]
