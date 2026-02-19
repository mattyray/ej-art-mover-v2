from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from workorders.models import Event

COLORS = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
    "#8c564b", "#e377c2", "#bcbd22", "#17becf",
]
COMPLETED_COLOR = "#6c757d"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_events(request):
    """Return scheduled events as calendar-compatible JSON. Supports ?start=&end= date range filtering."""
    events = Event.objects.filter(
        date__isnull=False
    ).select_related('work_order__client').order_by('date', 'daily_order', 'scheduled_time')

    start = request.query_params.get('start')
    end = request.query_params.get('end')
    if start:
        events = events.filter(date__gte=start[:10])
    if end:
        events = events.filter(date__lte=end[:10])

    data = []
    for event in events:
        wo = event.work_order
        title = f"{event.get_event_type_display()} - {wo.client.name}"

        color = COMPLETED_COLOR if event.completed else COLORS[wo.id % len(COLORS)]

        if event.scheduled_time:
            start = f"{event.date.isoformat()}T{event.scheduled_time.strftime('%H:%M:%S')}"
        else:
            start = event.date.isoformat()

        data.append({
            'id': f"event_{event.id}",
            'title': title,
            'start': start,
            'color': color,
            'workOrderId': wo.id,
            'dailyOrder': event.daily_order,
            'isEventCompleted': event.completed,
            'isWorkOrderCompleted': wo.status == 'completed',
            'isCompleted': event.completed,
        })

    return Response(data)
