from django.contrib import admin

from .models import Driver, Trailer, DailyLog, DutyStatus, Truck


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ["user", "license_number", "phone", "created_at"]
    list_filter = ["created_at"]
    search_fields = [
        "user__username",
        "user__first_name",
        "user__last_name",
        "license_number",
        "phone",
    ]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Truck)
class TruckAdmin(admin.ModelAdmin):
    list_display = ["truck_number", "make_model", "year", "license_plate", "created_at"]
    list_filter = ["year", "created_at"]
    search_fields = ["truck_number", "make_model", "license_plate"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Trailer)
class TrailerAdmin(admin.ModelAdmin):
    list_display = ["trailer_number", "trailer_type", "capacity", "created_at"]
    list_filter = ["trailer_type", "created_at"]
    search_fields = ["trailer_number", "capacity"]
    readonly_fields = ["created_at", "updated_at"]


class DutyStatusInline(admin.TabularInline):
    model = DutyStatus
    extra = 1
    fields = ["duty_status", "location_address", "timestamp", "notes"]
    readonly_fields = ["created_at"]


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "driver",
        "co_driver",
        "truck",
        "trailer",
        "status",
        "created_at",
    ]
    list_filter = ["status", "created_at", "truck", "trailer"]
    search_fields = [
        "driver__user__username",
        "co_driver__user__username",
        "truck__truck_number",
        "trailer__trailer_number",
    ]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [DutyStatusInline]
    fieldsets = (
        (
            "Daily Log Information",
            {"fields": ("driver", "co_driver", "truck", "trailer", "status")},
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(DutyStatus)
class DutyStatusAdmin(admin.ModelAdmin):
    list_display = ["daily_log", "duty_status", "location_address", "timestamp"]
    list_filter = ["duty_status", "timestamp", "created_at"]
    search_fields = ["daily_log__driver__user__username", "location_address", "notes"]
    readonly_fields = ["created_at"]
    ordering = ["daily_log", "timestamp"]
