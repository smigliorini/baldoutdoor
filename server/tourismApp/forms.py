from django.forms import ModelForm, TextInput
from django import forms
from django.forms import formset_factory
from django.utils.translation import ugettext_lazy as _
from .models import *


class ArtForm(ModelForm):
    class Meta:
        model = Art

        fields = ['name_it', 'descr_it', 'image_url', 'open_time', 'tickets', 'link']

        widgets = {
            'name_it': forms.TextInput(attrs={'placeholder': 'Nome punto di interesse'}),
            'image_url': forms.FileInput(),
        }

        labels = {
            'name_it': _('Name'),
            'descr_it': _('Description'),
            'image_url': _('Cover image'),
            'Link': _('Link'),
        }
        help_texts = {

        }
        error_messages = {

        }


class ArtForm_Trad(ModelForm):
    class Meta:
        model = Art
        fields = ['name_it', 'descr_it', 'open_time', 'tickets',]
        labels = {
            'name_it': _('Name'),
            'descr_it': _('Description'),
            'open_time': _('Open time'),
            'tickets': _('Tickets'),
        }

        widgets = {
            'name_it': forms.TextInput(attrs={'placeholder': 'Nome punto di interesse'}),
        }


class ArtForm_data(ModelForm):
    class Meta:
        model = Art
        fields = ['image_url', 'link']
        labels = {
            'image_url': _('Cover image'),
            'link': _('Link'),
        }

        widgets = {
            'image_url': forms.FileInput(attrs={'placeholder': "Immagini del POI"})
        }


class TourForm(ModelForm):
    class Meta:
        model = Tour
        fields = ['name_it', 'type', 'descr_it', 'image_url', 'duration', 'length', 'max_altitude', 'elevation_difference', 'filename']

        labels = {
            'name_it': _('Name'),
            'descr_it': _('Description'),
            'image_url': _('Cover image'),
            'filename': _('PDF'),
        }

        widgets = {
            'name_it': forms.TextInput(attrs={'placeholder': 'Nome punto del tour'}),
            'image_url': forms.FileInput(attrs={'placeholder': "Immagine del tour"}),
            'duration': forms.TextInput(attrs={'placeholder': 'Durata in ore'}),
            'length': forms.TextInput(attrs={'placeholder': 'Distanza in kilometri'}),
            'max_altitude': forms.TextInput(attrs={'placeholder': 'Altezza massima in metri'}),
            'elevation_difference': forms.TextInput(attrs={'placeholder': 'Dislivello in metri'}),
            'filename': forms.FileInput(attrs={'accept':'application/pdf'})
        }


class EventForm(ModelForm):
    class Meta:
        model = Event

        fields = ['name_it', 'descr_it', 'image_url', 'notes', 'tickets']

        widgets = {
            'name_it': forms.TextInput(attrs={'placeholder': 'Nome dell\'evento'}),
            'image_url': forms.FileInput(attrs={'placeholder': "Url dell'immagine"}),
        }

        labels = {
            'name_it': _('Name'),
            'descr_it': _('Description'),
            'image_url': _('Cover image'),
        }
        help_texts = {

        }
        error_messages = {

        }


class EventForm_data(ModelForm):
    class Meta:
        model = Event
        fields = ['image_url', 'notes']
        labels = {
            'image_url': _('Cover image'),
        }

        widgets = {
            'image_url': forms.FileInput(attrs={'placeholder': "Url dell'immagine"}),
        }


class EventForm_Trad(ModelForm):
    class Meta:
        model = Art
        fields = ['name_it', 'descr_it', 'tickets',]
        labels = {
            'name_it': _('Name'),
            'descr_it': _('Description'),
            'tickets': _('Tickets'),
        }

        widgets = {
            'name_it': forms.TextInput(attrs={'placeholder': 'Nome evento'}),
        }


class LocationForm(forms.Form):
    latitude = forms.FloatField(min_value=-90, max_value=90, widget=forms.NumberInput(attrs={'placeholder': 'Latitudine'}))
    longitude = forms.FloatField(min_value=-180, max_value=180, widget=forms.NumberInput(attrs={'placeholder': 'Longitudine'}))
    address = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Indirizzo'}))

class ArtMediaForm(forms.Form):
    path = forms.FileField(widget=forms.FileInput(attrs={"multiple": True}), required=False)

class TourMediaForm(forms.Form):
    path = forms.FileField(widget=forms.FileInput(attrs={"multiple": True}), required=False)

class EventMediaForm(forms.Form):
    path = forms.FileField(widget=forms.FileInput(attrs={"multiple": True}), required=False)