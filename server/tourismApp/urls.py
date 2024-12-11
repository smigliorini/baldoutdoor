from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('Art', views.filterItemArt, name="filterItemArt"),
    path('Tour', views.filterItemTour, name="filterItemTour"),
    path('Event', views.filterItemEvent, name="filterItemEvent"),
    path('Activity', views.filterItemActivity, name="filterItemActivity"),
    path('register', views.register, name="register"),
    path('logIn', views.logIn, name="logIn"),
    path('logOut', views.logOut, name="logOut"),
    path('editArt', views.editArt, name="editArt"),
    path('editTour',views.editTour, name="editTour"),
    path('editEvent',views.editEvent, name="editEvent"),
    path('editActivity', views.editActivity, name="editActivity"),
    path('edit/newArt', views.newArt, name="newArt"),
    path('edit/newTour', views.newTour, name="newTour"),
    path('edit/newEvent', views.newEvent, name="newEvent"),
    path('edit/newActivity', views.newActivity, name="newActivity"),
    path('edit/<str:classid>', views.editPoI1, name="editPoI1"),
    path('edit/translation/<str:classid_lang>', views.editPoI2, name="editPoI2"),
    path('edit/tour/<str:classid_lang>', views.editOneTour, name="editOneTour"),
    path('edit/tour/<str:classid>/points', views.editTourPoi, name="editTourPoi"),
    path('edit/event/<str:classid>', views.editEvent1, name="editEvent1"),
    path('edit/event/translation/<str:classid_lang>', views.editEvent2, name="editEvent2"),
    path('edit/activity/<str:classid>', views.editActivity1, name="editActivity1"),
    path('edit/activity/translation/<str:classid_lang>', views.editActivity2, name="editActivity2"),
    path('Art/<str:classid_lang>', views.itemPoI, name='itemPoI'),
    path('Tour/<str:classid_lang>', views.itemTour, name='itemTour'),
    path('Event/<str:classid_lang>', views.itemEvent, name='itemEvent'),
    path('Activity/<str:classid_lang>', views.itemActivity, name='itemActivity'),
]