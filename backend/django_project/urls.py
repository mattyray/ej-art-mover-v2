from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API routes
    path('api/clients/', include('clients.urls')),
    path('api/workorders/', include('workorders.urls')),
    path('api/invoices/', include('invoices.urls')),
    path('api/calendar/', include('calendar_app.urls')),
]
