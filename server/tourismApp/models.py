from django.contrib.gis.db import models
from django.db import connection
from django.db.models import Manager as GeoManager
from tinymce.models import HTMLField
from ckeditor.fields import RichTextField
from djrichtextfield.widgets import RichTextWidget
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.forms import ModelForm


class DArtEStato(models.Model):
    code = models.CharField(primary_key=True, max_length=80)
    name = models.CharField(max_length=160, blank=True, null=True)
    definition = models.CharField(max_length=1200, blank=True, null=True)
    alphacode = models.CharField(max_length=80, blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        managed = False
        db_table = 'd_art_e_stato'


class AArtCategoryArtCategory(models.Model):
    category = models.ForeignKey('ArtCategory', models.DO_NOTHING, db_column='category')
    points = models.ForeignKey('Art', models.DO_NOTHING, db_column='points')

    def __str__(self):
        return '{}, {}'.format(self.category, self.points)

    class Meta:
        managed = False
        db_table = 'a_art_category_art_category'
        unique_together = (('category', 'points'),)


class AArtTourTour(models.Model):
    point_of_interest = models.ForeignKey('Art', models.DO_NOTHING, db_column='point_of_interest')
    tour = models.ForeignKey('Tour', models.DO_NOTHING, db_column='tour')
    num = models.DecimalField(max_digits=15, decimal_places=0)

    def __str__(self):
        return '{}, {}'.format(self.point_of_interest, self.tour)

    class Meta:
        managed = False
        db_table = 'a_art_tour_tour'
        unique_together = (('point_of_interest', 'tour'),)


class AEventCategoryEventCategory(models.Model):
    event = models.ForeignKey('Event', models.DO_NOTHING, db_column='event')
    category = models.ForeignKey('EventCategory', models.DO_NOTHING, db_column='category')

    def __str__(self):
        return '{}, {}'.format(self.event, self.category)

    class Meta:
        managed = False
        db_table = 'a_event_category_event_category'
        unique_together = (('event', 'category'),)


class Art(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    descr_it = RichTextField(blank=True, null=True)
    name_it = models.CharField(max_length=100)
    image_url = models.ImageField(max_length=200, blank=True, null=True, upload_to='images/')
    state = models.ForeignKey('DArtEStato', models.DO_NOTHING, db_column='state', default=DArtEStato.objects.get(name='attivo'))
    area_di_download = models.MultiPolygonField(srid=4326, null=True)
    open_time = RichTextField(blank=True, null=True)
    tickets = RichTextField(blank=True, null=True)
    link = RichTextField(blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'art'


class ArtCategory(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    name_it = models.CharField(unique=True, max_length=200)

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'art_category'


class ArtCategoryNameTradT(models.Model):
    classref = models.ForeignKey(ArtCategory, models.DO_NOTHING, db_column='classref')
    name_trad_lang = models.ForeignKey('DELang', models.DO_NOTHING, db_column='name_trad_lang')
    name_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.name_trad_lang, self.name_trad_value)

    class Meta:
        managed = False
        db_table = 'art_category_name_trad_t'
        unique_together = (('classref', 'name_trad_lang', 'name_trad_value'),)


class ArtDescrTradT(models.Model):
    classref = models.ForeignKey(Art, models.DO_NOTHING, db_column='classref')
    descr_trad_lang = models.ForeignKey('DELang', models.DO_NOTHING, db_column='descr_trad_lang')
    descr_trad_value = models.TextField()

    def __str__(self):
        return '{}, {}'.format(self.classref, self.descr_trad_lang)

    class Meta:
        managed = False
        db_table = 'art_descr_trad_t'
        unique_together = (('classref', 'descr_trad_lang'),)


class ArtNameTradT(models.Model):
    classref = models.ForeignKey(Art, models.DO_NOTHING, db_column='classref')
    name_trad_lang = models.ForeignKey('DELang', models.DO_NOTHING, db_column='name_trad_lang')
    name_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.name_trad_lang, self.name_trad_value)

    class Meta:
        managed = False
        db_table = 'art_name_trad_t'
        unique_together = (('classref', 'name_trad_lang', 'name_trad_value'),)

##################errore##################
class ArtTradT(models.Model):
    classref = models.ForeignKey(Art, models.DO_NOTHING, db_column='classref', blank=True, null=True)
    lang = models.CharField(max_length=80, blank=True, null=True)
    notes_trad = models.CharField(max_length=16384, blank=True, null=True)
    open_time_trad = RichTextField(max_length=16384, blank=True, null=True)
    tickets_trad = RichTextField(max_length=16384, blank=True, null=True)

    def __str__(self):
        return '{}, {}'.format(self.classref, self.lang)

    class Meta:
        managed = False
        db_table = 'art_trad_t'


class Calendar(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    day = models.DateField()
    end_time = models.CharField(max_length=8, blank=True, null=True)
    start_time = models.CharField(max_length=8)
    event = models.ForeignKey('Event', models.DO_NOTHING, db_column='event')

    def __str__(self):
        return '{}, {}'.format(self.day, self.event)

    class Meta:
        managed = False
        db_table = 'calendar'
        unique_together = (('day', 'event'),)


class DELang(models.Model):
    code = models.CharField(primary_key=True, max_length=80)
    name = models.CharField(max_length=160, blank=True, null=True)
    definition = models.CharField(max_length=1200, blank=True, null=True)
    alphacode = models.CharField(max_length=80, blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        managed = False
        db_table = 'd_e_lang'


class DTourETipoit(models.Model):
    code = models.CharField(primary_key=True, max_length=80)
    name = models.CharField(max_length=160, blank=True, null=True)
    definition = models.CharField(max_length=1200, blank=True, null=True)
    alphacode = models.CharField(max_length=80, blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        managed = False
        db_table = 'd_tour_e_tipoit'


class Event(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    descr_it = RichTextField(blank=True, null=True)
    image_url = models.ImageField(max_length=200, blank=True, null=True, upload_to='images/')
    name_it = models.CharField(max_length=100)
    state = models.ForeignKey('DArtEStato', models.DO_NOTHING, db_column='state', default=DArtEStato.objects.get(name='attivo'))
    notes = models.CharField(max_length=1024, blank=True, null=True)
    tickets = RichTextField(blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'event'


class EventCategory(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    name_it = models.CharField(unique=True, max_length=200)

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'event_category'


class EventCategoryNameTradT(models.Model):
    classref = models.ForeignKey(EventCategory, models.DO_NOTHING, db_column='classref')
    name_trad_lang = models.ForeignKey(DELang, models.DO_NOTHING, db_column='name_trad_lang')
    name_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.name_trad_lang, self.name_trad_value)

    class Meta:
        managed = False
        db_table = 'event_category_name_trad_t'
        unique_together = (('classref', 'name_trad_lang', 'name_trad_value'),)


class EventDescrTradT(models.Model):
    classref = models.ForeignKey(Event, models.DO_NOTHING, db_column='classref')
    descr_trad_lang = models.ForeignKey(DELang, models.DO_NOTHING, db_column='descr_trad_lang')
    descr_trad_value = models.TextField()

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.descr_trad_lang, self.descr_trad_value)

    class Meta:
        managed = False
        db_table = 'event_descr_trad_t'
        unique_together = (('classref', 'descr_trad_lang', 'descr_trad_value'),)


class EventNameTradT(models.Model):
    classref = models.ForeignKey(Event, models.DO_NOTHING, db_column='classref')
    name_trad_lang = models.ForeignKey(DELang, models.DO_NOTHING, db_column='name_trad_lang')
    name_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.name_trad_lang, self.name_trad_value)

    class Meta:
        managed = False
        db_table = 'event_name_trad_t'
        unique_together = (('classref', 'name_trad_lang', 'name_trad_value'),)

class EventTradT(models.Model):
    classref = models.ForeignKey(Event, models.DO_NOTHING, db_column='classref', blank=True, null=True)
    lang = models.CharField(max_length=80, blank=True, null=True)
    notes_trad = models.CharField(max_length=16384, blank=True, null=True)
    open_time_trad = RichTextField(max_length=16384, blank=True, null=True)
    tickets_trad = RichTextField(max_length=16384, blank=True, null=True)

    def __str__(self):
        return '{}, {}'.format(self.classref, self.lang)

    class Meta:
        managed = False
        db_table = 'art_trad_t'

class EventMedia(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    path = models.ImageField(max_length=1024, blank=True, null=True, upload_to='images/')
    linked_event = models.ForeignKey(Event, models.DO_NOTHING, db_column='linked_event', blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.classid)

    class Meta:
        managed = False
        db_table = 'event_media'


class Location(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    address = models.TextField(blank=True, null=True)
    num = models.DecimalField(max_digits=15, decimal_places=0)
    event = models.CharField(max_length=70)
    geom = models.PointField(srid=4326, null=True)

    def __str__(self):
        return '{}'.format(self.address)

    class Meta:
        managed = False
        db_table = 'location'
        unique_together = (('num', 'event'),)


class ArtMedia(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    path = models.ImageField(max_length=200, blank=True, null=True, upload_to='images/')
    art = models.ForeignKey(Art, models.DO_NOTHING, db_column='art')

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'art_media'


class SpatialRefSys(models.Model):
    srid = models.IntegerField(primary_key=True)
    auth_name = models.CharField(max_length=256, blank=True, null=True)
    auth_srid = models.IntegerField(blank=True, null=True)
    srtext = models.CharField(max_length=2048, blank=True, null=True)
    proj4text = models.CharField(max_length=2048, blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.srid)

    class Meta:
        managed = False
        db_table = 'spatial_ref_sys'
 #       constraints = [CheckConstraint(
 #                       check=Q('srid' > 0 & 'srid' <= 998999),
  #                      name='srid_interval')]


class Tour(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    descr_it = RichTextField(max_length=8192)
    image_url = models.ImageField(max_length=100, blank=True, null=True, upload_to='images/')
    kml_path = models.CharField(max_length=8192, blank=True, null=True)
    name_it = models.CharField(max_length=200)
    geom_path = models.MultiLineStringField(srid=4326, null=True, blank=True)
    proximity_area = models.MultiPolygonField(srid=4326, null=True)
    duration = models.FloatField(blank=True, null=True)
    length = models.FloatField(blank=True, null=True)
    max_altitude = models.FloatField(blank=True, null=True)
    elevation_difference = models.FloatField(blank=True, null=True)
    filename = models.FileField(max_length=255, blank=True, null=True, upload_to='schede/')
    type = models.ForeignKey(DTourETipoit, models.DO_NOTHING, db_column='type', blank=True, null=True)
    state = models.ForeignKey('DArtEStato', models.DO_NOTHING, db_column='state', default=DArtEStato.objects.get(name='attivo'))

    def __str__(self):
        return '{}'.format(self.name_it)

    class Meta:
        managed = False
        db_table = 'tour'


class TourDescrTradT(models.Model):
    classref = models.ForeignKey(Tour, models.DO_NOTHING, db_column='classref')
    descr_trad_lang = models.ForeignKey(DELang, models.DO_NOTHING, db_column='descr_trad_lang')
    descr_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}'.format(self.classref, self.descr_trad_lang)

    class Meta:
        managed = False
        db_table = 'tour_descr_trad_t'


class TourNameTradT(models.Model):
    classref = models.ForeignKey(Tour, models.DO_NOTHING, db_column='classref')
    name_trad_lang = models.ForeignKey(DELang, models.DO_NOTHING, db_column='name_trad_lang')
    name_trad_value = models.CharField(max_length=16384)

    def __str__(self):
        return '{}, {}, {}'.format(self.classref, self.name_trad_lang, self.name_trad_value)

    class Meta:
        managed = False
        db_table = 'tour_name_trad_t'
        unique_together = (('classref', 'name_trad_lang', 'name_trad_value'),)

class TourMedia(models.Model):
    classid = models.CharField(primary_key=True, max_length=70)
    path = models.ImageField(max_length=1024, blank=True, null=True, upload_to='images/')
    tour = models.ForeignKey(Tour, models.DO_NOTHING, db_column='tour', blank=True, null=True)

    def __str__(self):
        return '{}'.format(self.classid)

    class Meta:
        managed = False
        db_table = 'tour_media'