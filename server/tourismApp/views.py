import random
import string

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User, auth
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.db import transaction
from django.contrib.gis.geos import Point

from .models import *
from .forms import *

# Create your views here.

def index(request):
    context = {
        #'lang' : Lang.objects.get(active=True),
    }
    return render(request, 'index.html', context)

def itemPoI(request,classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')

    try:
        art = Art.objects.get(classid=classid)
    except:
        print('except itemPoi Art')
        art = Art()

    cat = AArtCategoryArtCategory.objects.filter(points=art.classid)
    category = []
    for c in cat:
        category.append(c.category)

    #lang = Lang.objects.get(active=True)

    if lang == 'it':
        descr_trad = art.descr_it
        name_trad = art.name_it
        tickets_trad = art.tickets
        open_time_trad = art.open_time
    else:
        lang_table = DELang.objects.get(code=lang)
        try:
            descr_trad = ArtDescrTradT.objects.get(classref=art.classid, descr_trad_lang=lang_table).descr_trad_value
        except:
            descr_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)

        try:
            name_trad = ArtNameTradT.objects.get(classref=art.classid, name_trad_lang=lang_table).name_trad_value
        except:
            name_trad = art.name_it

        try:
            trad = ArtTradT.objects.get(classref=art.classid, lang=lang_table.code)
            tickets_trad = trad.tickets_trad
            open_time_trad = trad.open_time_trad
        except:
            tickets_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)
            open_time_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)
    try:
        location = Location.objects.get(event=art.classid, num='1')
        longitude, latitude = location.geom
        address = location.address
    except:
        longitude, latitude = None, None
        address = None
    context = {
        'art': art,
        'category': category,
        'lang' : lang,
        'descr_trad' : descr_trad,
        'name_trad' : name_trad,
        'tickets_trad': tickets_trad,
        'open_time_trad': open_time_trad,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'media': ArtMedia.objects.filter(art=art)
    }

    return render(request,'art-details.html', context)

def itemTour(request,classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')

    try:
        tour = Tour.objects.get(classid=classid)
    except:
        print('except itemTour Tour')
        tour = Tour()

    if lang == 'it':
        descr_trad = tour.descr_it
        name_trad = tour.name_it
    else:
        lang_table = DELang.objects.get(code=lang)
        try:
            descr_trad = TourDescrTradT.objects.get(classref=classid, descr_trad_lang=lang_table).descr_trad_value
        except:
            descr_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)

        try:
            name_trad = TourNameTradT.objects.get(classref=classid, name_trad_lang=lang_table).name_trad_value
        except:
            name_trad = tour.name_it

    art_tour = AArtTourTour.objects.filter(tour=classid).order_by('num')
    arts = Art.objects.none()
    for a in art_tour:
        arts |= Art.objects.filter(name_it=a.point_of_interest)

    context = {
        'tour': tour,
        'lang' : lang,
        'descr_trad' : descr_trad,
        'name_trad' : name_trad,
        'arts' : arts,
        'category_t': AArtCategoryArtCategory.objects,
        'order' : art_tour.values('num','point_of_interest'),
        'media': TourMedia.objects.filter(tour=tour)
    }

    return render(request,'tour-details.html', context)

def itemEvent(request,classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')

    try:
        event = Event.objects.get(classid=classid)
    except:
        print('except itemEvent Event')
        event = Event()

    calendar = Calendar.objects.filter(event=classid)

    cat = AEventCategoryEventCategory.objects.filter(event=event.classid)
    category = []
    for c in cat:
        category.append(c.category)

    #lang = Lang.objects.get(active=True)

    if lang == 'it':
        descr_trad = event.descr_it
        name_trad = event.name_it
        tickets_trad = event.tickets
        # open_time_trad = event.open_time
    else:
        lang_table = DELang.objects.get(code=lang)
        try:
            descr_trad = EventDescrTradT.objects.get(classref=event.classid, descr_trad_lang=lang_table).descr_trad_value
        except:
            descr_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)

        try:
            name_trad = EventNameTradT.objects.get(classref=event.classid, name_trad_lang=lang_table).name_trad_value
        except:
            name_trad = event.name_it

        try:
            trad = ArtTradT.objects.get(classref=event.classid, lang=lang_table.code)
            tickets_trad = trad.tickets_trad
        except:
            tickets_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)

    try:
        location = Location.objects.get(event=event.classid, num='1')
        longitude, latitude = location.geom
        address = location.address
    except:
        longitude, latitude = None, None
        address = None

    context = {
        'event': event,
        'category': category,
        'lang' : lang,
        'descr_trad' : descr_trad,
        'name_trad' : name_trad,
        'calendar': calendar,
        'media': EventMedia.objects.filter(linked_event=event),
        'tickets_trad': tickets_trad,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
    }

    return render(request,'event-details.html', context)

def itemActivity(request,classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')

    try:
        art = Art.objects.get(classid=classid)
    except:
        print('except itemActivity Activity')
        art = Art()

    cat = AArtCategoryArtCategory.objects.filter(points=art.classid)
    category = []
    for c in cat:
        category.append(c.category)

    #lang = Lang.objects.get(active=True)

    if lang == 'it':
        descr_trad = art.descr_it
        name_trad = art.name_it
        tickets_trad = art.tickets
        open_time_trad = art.open_time
    else:
        lang_table = DELang.objects.get(code=lang)
        try:
            descr_trad = ArtDescrTradT.objects.get(classref=art.classid, descr_trad_lang=lang_table).descr_trad_value
        except:
            descr_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)

        try:
            name_trad = ArtNameTradT.objects.get(classref=art.classid, name_trad_lang=lang_table).name_trad_value
        except:
            name_trad = art.name_it

        try:
            trad = ArtTradT.objects.get(classref=art.classid, lang=lang_table.code)
            tickets_trad = trad.tickets_trad
            open_time_trad = trad.open_time_trad
        except:
            tickets_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)
            open_time_trad = '<b style="color:red;">Non ancora tradotto in {}</b>'.format(lang_table.name)
    try:
        location = Location.objects.get(event=art.classid, num='1')
        longitude, latitude = location.geom
        address = location.address
    except:
        longitude, latitude = None, None
        address = None
    context = {
        'art': art,
        'category': category,
        'lang' : lang,
        'descr_trad' : descr_trad,
        'name_trad' : name_trad,
        'tickets_trad': tickets_trad,
        'open_time_trad': open_time_trad,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'media': ArtMedia.objects.filter(art=art)
    }

    return render(request,'activity-details.html', context)

def editArt(request):
    art = Art.objects.none()
    category_t = AArtCategoryArtCategory.objects.none()

    category_t |= AArtCategoryArtCategory.objects.exclude(category=str(3))

    for c in category_t:
        new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
        art |= new_art

    if request.method == 'POST':
        if '_restore' in request.POST:
            classid = request.POST['_classid']
            restore = Art.objects.get(classid=classid)
            restore.state = DArtEStato.objects.get(code='01')
            restore.save()

    context = {
        'art': art,
        'category': category_t,
    }

    return render(request, 'edit.html', context)

def editTour(request):
    if request.method == 'POST':
        if '_restore' in request.POST:
            classid = request.POST['_classid']
            restore = Tour.objects.get(classid=classid)
            restore.state = DArtEStato.objects.get(code='01')
            restore.save()

    context = {
        'tour': Tour.objects.order_by('name_it'),
    }

    return render(request, 'editTour.html', context)

def editEvent(request):
    if request.method == 'POST':
        if '_restore' in request.POST:
            classid = request.POST['_classid']
            restore = Event.objects.get(classid=classid)
            restore.state = DArtEStato.objects.get(code='01')
            restore.save()

    context = {
        'event': Event.objects.order_by('name_it'),
        'category': AEventCategoryEventCategory.objects,
    }

    return render(request, 'editEvent.html', context)

def editActivity(request):
    art = Art.objects.none()
    category_t = AArtCategoryArtCategory.objects.none()

    category_t |= AArtCategoryArtCategory.objects.filter(category=str(3))

    for c in category_t:
        new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
        art |= new_art

    if request.method == 'POST':
        if '_restore' in request.POST:
            classid = request.POST['_classid']
            restore = Art.objects.get(classid=classid)
            restore.state = DArtEStato.objects.get(code='01')
            restore.save()
        
    context = {
        'art': art,
        'category': category_t,
    }

    return render(request, 'editActivity.html', context)

def editPoI1(request, classid):
    category = ArtCategory.objects.exclude(classid=str(3)).order_by('classid')
    select = [None, False, False, False]
    for c in AArtCategoryArtCategory.objects.filter(points=classid):
        select[int(c.category.classid)] = True

    try:
        art = Art.objects.get(classid=classid)
    except:
        print('except editPoI1 Art')
        art = Art()

    try:
        location = Location.objects.get(event=classid, num='1')
        longitude, latitude = location.geom
        address = location.address
        new_location = False
    except:
        new_location = True
        while True:
            try:
                id = "".join(random.choices(string.digits, k=5))
                Location.objects.get(classid=id)
            except:
                location = Location(classid=id, address=None, event=classid, num='1', geom=None)
                latitude = ""
                longitude = ""
                address = ""
                break

    if request.method == 'POST':
        form = ArtForm_data(request.POST, request.FILES, instance=art)
        locationForm = LocationForm(request.POST)

        if '_delete' in request.POST:
            art = Art.objects.get(classid=classid)
            art.state = DArtEStato.objects.get(code='02')
            art.save()
            return redirect('editArt')

        if '_delete_media' in request.POST:
            if art.image_url in request.POST:
                art = Art.objects.get(classid=classid)
                art.image_url = None
                art.save()
            media = ArtMedia.objects.filter(art=classid)
            for obj in media:
                if obj.path in request.POST:
                    ArtMedia.objects.filter(path=obj.path).delete()

        if form.is_valid() and locationForm.is_valid() and '_delete_media' not in request.POST and '_delete' not in request.POST:
            address = locationForm.cleaned_data['address']
            latitude = locationForm.cleaned_data['latitude']
            longitude = locationForm.cleaned_data['longitude']

            form.save()

            for file in request.FILES.getlist('path'):
                while True:
                    try:
                        id = "".join(random.choices(string.digits, k=6))
                        ArtMedia.objects.get(classid=id)
                    except:
                        media = ArtMedia.objects.create(classid=id, path=file, art=art)
                        media.save()
                        break

            with transaction.atomic():
                if new_location:
                    location.address = address
                    location.geom = Point(float(longitude), float(latitude))
                    location.save()
                else:
                    if address != location.address:
                        Location.objects.filter(event=classid, num='1').update(address=address)
                    if (longitude,latitude) != location.geom:
                        Location.objects.filter(event=classid, num='1').update(geom=Point(float(longitude),
                                                                                          float(latitude)))

                for c in range(1, len(category) + 1):
                    if 'categoria_{}'.format(c) in request.POST:
                        if not select[c]:
                            newArtCat = AArtCategoryArtCategory(points=art, category=ArtCategory.objects.get(classid=str(c)))
                            newArtCat.save()
                    else:
                        if select[c]:
                            AArtCategoryArtCategory.objects.get(points=art, category=ArtCategory.objects.get(classid=str(c))).delete()

        if '_delete_media' not in request.POST:
            return redirect('/edit/translation/{}'.format(classid))

    context = {
        'art' : art,
        'category': category,
        'select': select,
        'form' : ArtForm_data(initial={'image_url': art.image_url, 'link': art.link}),
        'mediaForm' : ArtMediaForm(),
        'media' : ArtMedia.objects.filter(art=art),
        'locationForm': LocationForm(initial={'address': address, 'latitude':latitude, 'longitude': longitude}),
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        #'state':DArtEStato.objects
    }

    return render(request,'editPointOfInterest.html', context)

def editPoI2(request, classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')
        de_lang = DELang.objects.get(code=lang)

    art = Art.objects.get(classid=classid)

    if lang == 'it':
        descr = art.descr_it
        name = art.name_it
        tickets = art.tickets
        open_time = art.open_time
        #notes = art.notes
        translated = True
    else:
        translated = False
        try:
            descr_obj = ArtDescrTradT.objects.get(classref=art.classid, descr_trad_lang=de_lang)
            descr = descr_obj.descr_trad_value
            descr_t = True
        except:
            descr_t = False
            descr_obj = ArtDescrTradT()
            descr_obj.classref = art
            descr_obj.descr_trad_lang = de_lang
            descr_obj.descr_trad_value = ""
            descr = descr_obj.descr_trad_value
            #descr_obj.save()

        try:
            name_obj = ArtNameTradT.objects.get(classref=art.classid, name_trad_lang=de_lang)
            name = name_obj.name_trad_value
            name_t = True
        except:
            name_t = False
            name_obj = ArtNameTradT()
            name_obj.classref = art
            name_obj.name_trad_lang = de_lang
            name_obj.name_trad_value = ""
            name = name_obj.name_trad_value
            #name_obj.save()

        try:
            trad_obj = ArtTradT.objects.get(classref=art.classid, lang=de_lang.code)
            tickets = trad_obj.tickets_trad
            open_time = trad_obj.open_time_trad
            #notes = trad_obj.notes_trad
            trad_t = True
        except:
            trad_t = False
            trad_obj = ArtTradT()
            trad_obj.classref = art
            trad_obj.lang = de_lang.code
            trad_obj.tickets_trad = ""
            tickets = trad_obj.tickets_trad
            trad_obj.open_time_trad = ""
            open_time = trad_obj.open_time_trad
            #notes = None

    if request.method == 'POST':
        form = ArtForm_Trad(request.POST)

        if form.is_valid():
            descr = form.cleaned_data['descr_it']
            name = form.cleaned_data['name_it']
            tickets = form.cleaned_data['tickets']
            open_time = form.cleaned_data['open_time']
            #notes = form.cleaned_data['notes']
        else:
            if 'open_time' in form.errors:
                messages.info(request, 'Field Open time is too long!')
                context = {
                    'art': art,
                    'lang': lang,
                    'descr': descr,
                    'name': name,
                    'form': ArtForm_Trad(
                        initial={'name_it': name, 'descr_it': descr, 'open_time': open_time, 'tickets': tickets, })
                    # 'state':DArtEStato.objects
                }

                return render(request, 'editPoiTranslate.html', context)
            elif 'tickets' in form.errors:
                messages.info(request, 'Field Tickets is too long!')
                context = {
                    'art': art,
                    'lang': lang,
                    'descr': descr,
                    'name': name,
                    'form': ArtForm_Trad(
                        initial={'name_it': name, 'descr_it': descr, 'open_time': open_time, 'tickets': tickets, })
                    # 'state':DArtEStato.objects
                }

                return render(request, 'editPoiTranslate.html', context)

        with transaction.atomic():
            if not translated:
                if not name_t:
                    name_obj.save()
                if not descr_t:
                    descr_obj.save()
                if not trad_t:
                    trad_obj.save()

            if lang == 'it':
                if art.name_it != name:
                    Art.objects.filter(classid=classid).update(name_it=name)
                if art.descr_it != descr:
                    Art.objects.filter(classid=classid).update(descr_it=descr)
                #if art.notes != notes:
                #    Art.objects.filter(classid=classid).update(notes=notes)
                if art.open_time != open_time:
                    Art.objects.filter(classid=classid).update(open_time=open_time)
                if art.tickets != tickets:
                    Art.objects.filter(classid=classid).update(tickets=tickets)
            else:
                if name_obj.name_trad_value != name:
                    ArtNameTradT.objects.filter(classref=classid, name_trad_lang=de_lang).update(name_trad_value=name)
                if descr_obj.descr_trad_value != descr:
                    ArtDescrTradT.objects.filter(classref=classid, descr_trad_lang=de_lang).update(descr_trad_value=descr)
                #if trad_obj.notes_trad != notes:
                #    ArtTradT.objects.filter(classref=classid).update(notes_trad=notes)
                if trad_obj.open_time_trad != open_time:
                    ArtTradT.objects.filter(classref=classid, lang=de_lang.code).update(open_time_trad=open_time)
                if trad_obj.tickets_trad != tickets:
                    ArtTradT.objects.filter(classref=classid, lang=de_lang.code).update(tickets_trad=tickets)

            if '_save' in request.POST:
                return redirect('/Art/{}+{}'.format(classid,lang))
            if '_continue' in request.POST:
                if lang=='it':
                    return redirect('/edit/translation/{}+{}'.format(classid, 'en'))
                de_lang = DELang.objects.order_by('name')
                if lang == 'en':
                    found = True
                else:
                    found = False
                for l in de_lang:
                    if l.code != 'en' and found:
                        return redirect('/edit/translation/{}+{}'.format(classid, l.code))
                    if l.code == lang:
                        found = True
                return redirect('/Art/{}+{}'.format(classid, lang))

    context = {
        'art' : art,
        'lang' : lang,
        'descr' : descr,
        'name' : name,
        'form' : ArtForm_Trad(initial={'name_it': name, 'descr_it': descr, 'open_time': open_time, 'tickets': tickets,})
        #'state':DArtEStato.objects
    }

    return render(request,'editPoiTranslate.html', context)

def editOneTour(request, classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')
        de_lang = DELang.objects.get(code=lang)

    tour = Tour.objects.get(classid=classid)

    if lang == 'it':
        descr = tour.descr_it
        name = tour.name_it
    else:
        try:
            descr_obj = TourDescrTradT.objects.get(classref=tour.classid, descr_trad_lang=de_lang)
            descr = descr_obj.descr_trad_value
        except:
            descr_obj = TourDescrTradT()
            descr_obj.classref = tour
            descr_obj.descr_trad_lang = de_lang
            descr_obj.descr_trad_value = ""
            descr = descr_obj.descr_trad_value
            descr_obj.save()

        try:
            name_obj = TourNameTradT.objects.get(classref=tour.classid, name_trad_lang=de_lang)
            name = name_obj.name_trad_value
        except:
            name_obj = TourNameTradT()
            name_obj.classref = tour
            name_obj.name_trad_lang = de_lang
            name_obj.name_trad_value = ""
            name = name_obj.name_trad_value
            name_obj.save()

    form = TourForm(request.POST or None, request.FILES or None, instance=tour)

    if request.method == "POST":
        if '_delete' in request.POST:
            tour.state = DArtEStato.objects.get(code='02')
            tour.save()
            return redirect('editTour')

        if '_delete_media' in request.POST:
            if tour.image_url in request.POST:
                Tour.objects.filter(classid=classid).update(image_url=None)
                tour.save()
            media = TourMedia.objects.filter(tour=classid)
            for obj in media:
                if obj.path in request.POST:
                    TourMedia.objects.filter(path=obj.path).delete()

    if form.is_valid():
        name = form.cleaned_data['name_it']
        descr = form.cleaned_data['descr_it']
        
        if lang != 'it':
            tour = Tour.objects.get(classid=classid)
            tmp = form.save(commit=False)
            tmp.name_it = tour.name_it
            tmp.descr_it = tour.descr_it
            tmp.save()
            if name_obj.name_trad_value != name:
                TourNameTradT.objects.filter(classref=classid, name_trad_lang=de_lang).update(name_trad_value=name)
            if descr_obj.descr_trad_value != descr:
                TourDescrTradT.objects.filter(classref=classid, descr_trad_lang=de_lang).update(descr_trad_value=descr)
        else:
            form.save()

            for file in request.FILES.getlist('path'):
                while True:
                    try:
                        id = "".join(random.choices(string.digits, k=6))
                        TourMedia.objects.get(classid=id)
                    except:
                        media = TourMedia.objects.create(classid=id, path=file, tour=tour)
                        media.save()
                        break

        if '_editPOI' in request.POST:
            return redirect('/edit/tour/{}/points'.format(classid,lang))
        if '_save' in request.POST:
            return redirect('/Tour/{}+{}'.format(classid,lang))

    context = {
        'lang' : lang,
        'tour' : tour,
        'form' : TourForm(initial={'name_it': name, 'type': tour.type, 'descr_it': descr, 'image_url': tour.image_url,
                                   'kml_path': tour.kml_path, 'duration': tour.duration, 'length': tour.length, 
                                   'elevation_difference': tour.elevation_difference, 'max_altitude': tour.max_altitude,
                                   'filename': tour.filename}),
        'mediaForm' : TourMediaForm(),
        'media' : TourMedia.objects.filter(tour=tour)
    }

    return render(request,'editOneTour.html', context)

def editTourPoi(request,classid):
    poi_in_Tour = AArtTourTour.objects.filter(tour=classid).order_by('num')
    if request.method == 'POST':
        #poi_in_Tour = AArtTourTour.objects.filter(tour=classid)
        number_poi = len(poi_in_Tour)
        if '_add' in request.POST:
            poi = Art.objects.get(classid=request.POST['art'])

            art_tour = AArtTourTour(point_of_interest=poi, tour=Tour.objects.get(classid=classid), num=number_poi + 1)
            art_tour.save()

            return redirect('/edit/tour/{}/points'.format(classid))

        for d in range(1, number_poi + 1):
            if '_delete{}'.format(d) in request.POST:
                with transaction.atomic():
                    obj = AArtTourTour.objects.get(num=d, tour=classid)
                    obj.delete()

                    for num in range(d + 1, number_poi + 1):
                        AArtTourTour.objects.filter(num=num, tour=classid).update(num=num-1)

                return redirect('/edit/tour/{}/points'.format(classid))

            if '_up{}'.format(d) in request.POST:
                first = d - 1
                second = d
                with transaction.atomic():
                    obj1 = AArtTourTour.objects.get(num=first, tour=classid)
                    obj2 = AArtTourTour.objects.get(num=second, tour=classid)
                    AArtTourTour.objects.filter(point_of_interest=obj1.point_of_interest,tour=classid).update(num=second)
                    AArtTourTour.objects.filter(point_of_interest=obj2.point_of_interest,tour=classid).update(num=first)

                return redirect('/edit/tour/{}/points'.format(classid))

            if '_down{}'.format(d) in request.POST:
                first = d
                second = d + 1
                with transaction.atomic():
                    obj1 = AArtTourTour.objects.get(num=first, tour=classid)
                    obj2 = AArtTourTour.objects.get(num=second, tour=classid)
                    AArtTourTour.objects.filter(point_of_interest=obj1.point_of_interest, tour=classid).update(
                        num=second)
                    AArtTourTour.objects.filter(point_of_interest=obj2.point_of_interest, tour=classid).update(
                        num=first)

                return redirect('/edit/tour/{}/points'.format(classid))

        if '_save' in request.POST:
            num = 0
            try:
                for poi in dict(request.POST)['poi']:
                    num += 1
                    obj = AArtTourTour.objects.get(num=num, tour=classid)
                    if obj.point_of_interest.classid != poi:
                        with transaction.atomic():
                            newPoi = Art.objects.get(classid=poi).name_it
                            obj.delete()
                            art_tour = AArtTourTour(point_of_interest=Art.objects.get(classid=poi),
                                                    tour=Tour.objects.get(classid=classid),num=num)

                            try:
                                art_tour.save()
                            except:
                                print("Due chiavi uguali, non fatto nulla")
                                messages.info(request, '"{}" was assigned to two different points of interest!'.format(newPoi))
                                return redirect('/edit/tour/{}/points'.format(classid))
            except KeyError:
                pass
            return redirect('/Tour/{}'.format(classid))
    else:
        #poi_in_Tour = AArtTourTour.objects.filter(tour=classid).order_by('num')
        context = {
            'tour': Tour.objects.get(classid=classid),
            'poi': poi_in_Tour,
            'art': Art.objects.order_by('name_it'),
            'len': len(poi_in_Tour),
            'end': True if len(poi_in_Tour) < 15 else False
        }
        return render(request, 'editTourPoI.html', context)
    
def editEvent1(request, classid):
    category = EventCategory.objects.order_by('classid')
    select = [None, False, False, False]
    for c in AEventCategoryEventCategory.objects.filter(event=classid):
        select[int(c.category.classid)] = True

    try:
        event = Event.objects.get(classid=classid)
    except:
        print('except editEvent1 Event')
        event = Event()

    try:
        calendar = Calendar.objects.filter(event=classid)
    except:
        print('except editEvent1 Calendar')
        calendar = Calendar()

    try:
        location = Location.objects.get(event=classid, num='1')
        longitude, latitude = location.geom
        address = location.address
        new_location = False
    except:
        new_location = True
        while True:
            try:
                id = "".join(random.choices(string.digits, k=5))
                Location.objects.get(classid=id)
            except:
                location = Location(classid=id, address=None, event=classid, num='1', geom=None)
                latitude = ""
                longitude = ""
                address = ""
                break


    if request.method == 'POST':
        form = EventForm_data(request.POST, request.FILES, instance=event)
        locationForm = LocationForm(request.POST)

        if '_delete' in request.POST:
            event = Event.objects.get(classid=classid)
            event.state = DArtEStato.objects.get(code='02')
            event.save()
            return redirect('editEvent')
        
        if '_delete_media' in request.POST:
            if event.image_url in request.POST:
                Event.objects.get(classid=classid)
                event.image_url = None
                event.save()
            media = EventMedia.objects.filter(linked_event=classid)
            for obj in media:
                if obj.path in request.POST:
                    EventMedia.objects.filter(path=obj.path).delete()

        if form.is_valid() and locationForm.is_valid() and '_delete_media' not in request.POST and '_delete' not in request.POST:
            # notes = form.cleaned_data['notes']
            address = locationForm.cleaned_data['address']
            latitude = locationForm.cleaned_data['latitude']
            longitude = locationForm.cleaned_data['longitude']
            form.save()

            with transaction.atomic():
                # if notes != 'None' and event.notes != notes:
                    # Event.objects.filter(classid=classid).update(notes=notes)

                if new_location:
                    location.address = address
                    location.geom = Point(float(longitude), float(latitude))
                    location.save()
                else:
                    if address != location.address:
                        Location.objects.filter(event=classid, num='1').update(address=address)
                    if (longitude,latitude) != location.geom:
                        Location.objects.filter(event=classid, num='1').update(geom=Point(float(longitude),
                                                                                          float(latitude)))

                for file in request.FILES.getlist('path'):
                    while True:
                        try:
                            id = "".join(random.choices(string.digits, k=6))
                            EventMedia.objects.get(classid=id)
                        except:
                            media = EventMedia.objects.create(classid=id, path=file, linked_event=event)
                            media.save()
                            break

                for c in range(1, len(category) + 1):
                    if 'categoria_{}'.format(c) in request.POST:
                        if select[c]:
                            select[c] = None
                        elif not select[c]:
                            newEventCat = AEventCategoryEventCategory(event=event, category=EventCategory.objects.get(classid=str(c)))
                            newEventCat.save()
                    else:
                        if select[c]:
                            AEventCategoryEventCategory.objects.get(event=event, category=EventCategory.objects.get(classid=str(c))).delete()

                num_forms = int(request.POST.get('num-forms'))
                if num_forms > 0:
                    # update or delete
                    for obj in calendar.all():
                        if '{}-day'.format(obj.classid) not in request.POST:
                            Calendar.objects.get(classid=obj.classid).delete()
                        else:
                            day = request.POST.get('{}-day'.format(obj.classid))
                            start_time = request.POST.get('{}-start_time'.format(obj.classid))
                            end_time = request.POST.get('{}-end_time'.format(obj.classid))

                            if day == '' or start_time == '':
                                messages.info(request, "Day or start time missing!")
                                for c in AEventCategoryEventCategory.objects.filter(event=classid):
                                    select[int(c.category.classid)] = True
                                context = {
                                    'event' : event,
                                    'category': category,
                                    'calendar': calendar,
                                    'select': select,
                                    'form' : EventForm_data(initial={'image_url': event.image_url, 'notes': event.notes}),
                                    'mediaForm': EventMediaForm(),
                                    'media' : EventMedia.objects.filter(linked_event=event),
                                    'locationForm': LocationForm(initial={'address': address, 'latitude':latitude, 'longitude': longitude}),
                                    'address': address,
                                    'latitude': latitude,
                                    'longitude': longitude,
                                }

                                return render(request, 'editEventContents.html', context)
                            
                            obj.day = day
                            obj.start_time = start_time
                            if end_time != '':
                                obj.end_time = end_time

                            obj.save()

                    # add new days
                    for i in range(0, num_forms):
                        day = request.POST.get('form-{}-day'.format(i))
                        start_time = request.POST.get('form-{}-start_time'.format(i))
                        end_time = request.POST.get('form-{}-end_time'.format(i))

                        if (day != '' and day != None) or (start_time != '' and start_time != None):
                            if day == '' or start_time == '':
                                messages.info(request, "Day or start time missing!")
                                for c in AEventCategoryEventCategory.objects.filter(event=classid):
                                    select[int(c.category.classid)] = True
                                context = {
                                    'event' : event,
                                    'category': category,
                                    'calendar': calendar,
                                    'select': select,
                                    'form' : EventForm_data(initial={'image_url': event.image_url, 'notes': event.notes}),
                                    'mediaForm': EventMediaForm(),
                                    'media' : EventMedia.objects.filter(linked_event=event),
                                    'locationForm': LocationForm(initial={'address': address, 'latitude':latitude, 'longitude': longitude}),
                                    'address': address,
                                    'latitude': latitude,
                                    'longitude': longitude,
                                }

                                return render(request, 'editEventContents.html', context)

                            while True:
                                try:
                                    id_calendar = "".join(random.choices(string.digits, k=6))
                                    Calendar.objects.get(classid=id_calendar)
                                except:
                                    calendar = Calendar(classid=id_calendar)
                                    break
                            
                            calendar.event = event
                            calendar.day = day
                            calendar.start_time = start_time
                            if end_time != '':
                                calendar.end_time = end_time

                            calendar.save()
                            
        return redirect('/edit/event/translation/{}'.format(classid))

    context = {
        'event' : event,
        'category': category,
        'calendar': calendar,
        'select': select,
        'form' : EventForm_data(initial={'image_url': event.image_url, 'notes': event.notes}),
        'mediaForm': EventMediaForm(),
        'media' : EventMedia.objects.filter(linked_event=event),
        'locationForm': LocationForm(initial={'address': address, 'latitude':latitude, 'longitude': longitude}),
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        #'state':DArtEStato.objects
    }
    return render(request,'editEventContents.html', context)

def editEvent2(request, classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')
        de_lang = DELang.objects.get(code=lang)

    event = Event.objects.get(classid=classid)

    if lang == 'it':
        descr = event.descr_it
        name = event.name_it
        tickets = event.tickets
        #notes = art.notes
        translated = True
    else:
        translated = False
        try:
            descr_obj = EventDescrTradT.objects.get(classref=event.classid, descr_trad_lang=de_lang)
            descr = descr_obj.descr_trad_value
            descr_t = True
        except:
            descr_t = False
            descr_obj = EventDescrTradT()
            descr_obj.classref = event
            descr_obj.descr_trad_lang = de_lang
            descr_obj.descr_trad_value = ""
            descr = descr_obj.descr_trad_value
            #descr_obj.save()

        try:
            name_obj = EventNameTradT.objects.get(classref=event.classid, name_trad_lang=de_lang)
            name = name_obj.name_trad_value
            name_t = True
        except:
            name_t = False
            name_obj = EventNameTradT()
            name_obj.classref = event
            name_obj.name_trad_lang = de_lang
            name_obj.name_trad_value = ""
            name = name_obj.name_trad_value
            #name_obj.save()

        try:
            trad_obj = EventTradT.objects.get(classref=event.classid, lang=de_lang.code)
            tickets = trad_obj.tickets_trad
            #notes = trad_obj.notes_trad
            trad_t = True
        except:
            trad_t = False
            trad_obj = EventTradT()
            trad_obj.classref = event
            trad_obj.lang = de_lang.code
            trad_obj.tickets_trad = ""
            tickets = trad_obj.tickets_trad
            #notes = None

    if request.method == 'POST':
        form = EventForm_Trad(request.POST)

        if form.is_valid():
            descr = form.cleaned_data['descr_it']
            name = form.cleaned_data['name_it']
            tickets = form.cleaned_data['tickets']
            #notes = form.cleaned_data['notes']
        else:
            if 'tickets' in form.errors:
                messages.info(request, 'Field Tickets is too long!')
                context = {
                    'event': event,
                    'lang': lang,
                    'descr': descr,
                    'name': name,
                    'form': EventForm_Trad(
                        initial={'name_it': name, 'descr_it': descr, 'tickets': tickets, })
                    # 'state':DArtEStato.objects
                }

                return render(request, 'editEventTranslate.html', context)

        with transaction.atomic():
            if not translated:
                if not name_t:
                    name_obj.save()
                if not descr_t:
                    descr_obj.save()
                if not trad_t:
                    trad_obj.save()

            if lang == 'it':
                if event.name_it != name:
                    Event.objects.filter(classid=classid).update(name_it=name)
                if event.descr_it != descr:
                    Event.objects.filter(classid=classid).update(descr_it=descr)
                #if art.notes != notes:
                #    Art.objects.filter(classid=classid).update(notes=notes)
                if event.tickets != tickets:
                    Event.objects.filter(classid=classid).update(tickets=tickets)
            else:
                if name_obj.name_trad_value != name:
                    EventNameTradT.objects.filter(classref=classid, name_trad_lang=de_lang).update(name_trad_value=name)
                if descr_obj.descr_trad_value != descr:
                    EventDescrTradT.objects.filter(classref=classid, descr_trad_lang=de_lang).update(descr_trad_value=descr)
                #if trad_obj.notes_trad != notes:
                #    ArtTradT.objects.filter(classref=classid).update(notes_trad=notes)
                if trad_obj.tickets_trad != tickets:
                    EventTradT.objects.filter(classref=classid, lang=de_lang.code).update(tickets_trad=tickets)

            if '_save' in request.POST:
                return redirect('/Event/{}+{}'.format(classid,lang))
            if '_continue' in request.POST:
                if lang=='it':
                    return redirect('/edit/event/translation/{}+{}'.format(classid, 'en'))
                de_lang = DELang.objects.order_by('name')
                if lang == 'en':
                    found = True
                else:
                    found = False
                for l in de_lang:
                    if l.code != 'en' and found:
                        return redirect('/edit/event/translation/{}+{}'.format(classid, l.code))
                    if l.code == lang:
                        found = True
                return redirect('/Event/{}+{}'.format(classid, lang))

    context = {
        'event' : event,
        'lang' : lang,
        'descr' : descr,
        'name' : name,
        'form' : EventForm_Trad(initial={'name_it': name, 'descr_it': descr, 'tickets': tickets,}),
        # 'state':DArtEStato.objects
    }

    return render(request,'editEventTranslate.html', context)

def editActivity1(request, classid):
    try:
        art = Art.objects.get(classid=classid)
    except:
        print('except editActivity1 Activity')
        art = Art()

    try:
        location = Location.objects.get(event=classid, num='1')
        longitude, latitude = location.geom
        address = location.address
        new_location = False
    except:
        new_location = True
        while True:
            try:
                id = "".join(random.choices(string.digits, k=5))
                Location.objects.get(classid=id)
            except:
                location = Location(classid=id, address=None, event=classid, num='1', geom=None)
                latitude = ""
                longitude = ""
                address = ""
                break


    if request.method == 'POST':
        
        form = ArtForm_data(request.POST, request.FILES, instance=art)
        locationForm = LocationForm(request.POST)

        if '_delete' in request.POST:
            art = Art.objects.get(classid=classid)
            art.state = DArtEStato.objects.get(code='02')
            art.save()
            return redirect('editActivity')

        if '_delete_media' in request.POST:
            if art.image_url in request.POST:
                art = Art.objects.get(classid=classid)
                art.image_url = None
                art.save()
            media = ArtMedia.objects.filter(art=classid)
            for obj in media:
                if obj.path in request.POST:
                    ArtMedia.objects.filter(path=obj.path).delete()
        
        for file in request.FILES.getlist('path'):
            while True:
                try:
                    id = "".join(random.choices(string.digits, k=6))
                    ArtMedia.objects.get(classid=id)
                except:
                    media = ArtMedia.objects.create(classid=id, path=file, art=art)
                    media.save()
                    break

        if form.is_valid() and locationForm.is_valid() and '_delete_media' not in request.POST and '_delete' not in request.POST:
            address = locationForm.cleaned_data['address']
            latitude = locationForm.cleaned_data['latitude']
            longitude = locationForm.cleaned_data['longitude']

            form.save()

            with transaction.atomic():
                if new_location:
                    location.address = address
                    location.geom = Point(float(longitude), float(latitude))
                    location.save()
                else:
                    if address != location.address:
                        Location.objects.filter(event=classid, num='1').update(address=address)
                    if (longitude,latitude) != location.geom:
                        Location.objects.filter(event=classid, num='1').update(geom=Point(float(longitude),
                                                                                          float(latitude)))

        return redirect('/edit/activity/translation/{}'.format(classid))

    context = {
        'art' : art,
        'form' : ArtForm_data(initial={'image_url': art.image_url, 'link': art.link}),
        'mediaForm' : ArtMediaForm(),
        'media' : ArtMedia.objects.filter(art=art),
        'locationForm': LocationForm(initial={'address': address, 'latitude':latitude, 'longitude': longitude}),
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        #'state':DArtEStato.objects
    }

    return render(request,'editActivityContents.html', context)

def editActivity2(request, classid_lang):
    if '+' not in classid_lang:
        classid, lang = classid_lang, 'it'
    else:
        classid, lang = classid_lang.split('+')
        de_lang = DELang.objects.get(code=lang)

    art = Art.objects.get(classid=classid)

    if lang == 'it':
        descr = art.descr_it
        name = art.name_it
        open_time = art.open_time
        #notes = art.notes
        translated = True
    else:
        translated = False
        try:
            descr_obj = ArtDescrTradT.objects.get(classref=art.classid, descr_trad_lang=de_lang)
            descr = descr_obj.descr_trad_value
            descr_t = True
        except:
            descr_t = False
            descr_obj = ArtDescrTradT()
            descr_obj.classref = art
            descr_obj.descr_trad_lang = de_lang
            descr_obj.descr_trad_value = ""
            descr = descr_obj.descr_trad_value
            #descr_obj.save()

        try:
            name_obj = ArtNameTradT.objects.get(classref=art.classid, name_trad_lang=de_lang)
            name = name_obj.name_trad_value
            name_t = True
        except:
            name_t = False
            name_obj = ArtNameTradT()
            name_obj.classref = art
            name_obj.name_trad_lang = de_lang
            name_obj.name_trad_value = ""
            name = name_obj.name_trad_value
            #name_obj.save()

        try:
            trad_obj = ArtTradT.objects.get(classref=art.classid, lang=de_lang.code)
            open_time = trad_obj.open_time_trad
            #notes = trad_obj.notes_trad
            trad_t = True
        except:
            trad_t = False
            trad_obj = ArtTradT()
            trad_obj.classref = art
            trad_obj.lang = de_lang.code
            open_time = trad_obj.open_time_trad
            #notes = None

    if request.method == 'POST':

        form = ArtForm_Trad(request.POST)

        if form.is_valid():
            descr = form.cleaned_data['descr_it']
            name = form.cleaned_data['name_it']
            open_time = form.cleaned_data['open_time']
            #notes = form.cleaned_data['notes']
        else:
            if 'open_time' in form.errors:
                messages.info(request, 'Field Open time is too long!')
                context = {
                    'art': art,
                    'lang': lang,
                    'descr': descr,
                    'name': name,
                    'form': ArtForm_Trad(
                        initial={'name_it': name, 'descr_it': descr, 'open_time': open_time,})
                    # 'state':DArtEStato.objects
                }

                return render(request, 'editActivityTranslate.html', context)

        with transaction.atomic():
            if not translated:
                if not name_t:
                    name_obj.save()
                if not descr_t:
                    descr_obj.save()
                if not trad_t:
                    trad_obj.save()

            if lang == 'it':
                if art.name_it != name:
                    Art.objects.filter(classid=classid).update(name_it=name)
                if art.descr_it != descr:
                    Art.objects.filter(classid=classid).update(descr_it=descr)
                #if art.notes != notes:
                #    Art.objects.filter(classid=classid).update(notes=notes)
                if art.open_time != open_time:
                    Art.objects.filter(classid=classid).update(open_time=open_time)
            else:
                if name_obj.name_trad_value != name:
                    ArtNameTradT.objects.filter(classref=classid, name_trad_lang=de_lang).update(name_trad_value=name)
                if descr_obj.descr_trad_value != descr:
                    ArtDescrTradT.objects.filter(classref=classid, descr_trad_lang=de_lang).update(descr_trad_value=descr)
                #if trad_obj.notes_trad != notes:
                #    ArtTradT.objects.filter(classref=classid).update(notes_trad=notes)
                if trad_obj.open_time_trad != open_time:
                    ArtTradT.objects.filter(classref=classid, lang=de_lang.code).update(open_time_trad=open_time)

            if '_save' in request.POST:
                return redirect('/Activity/{}+{}'.format(classid,lang))
            if '_continue' in request.POST:
                if lang=='it':
                    return redirect('/edit/activity/translation/{}+{}'.format(classid, 'en'))
                de_lang = DELang.objects.order_by('name')
                if lang == 'en':
                    found = True
                else:
                    found = False
                for l in de_lang:
                    if l.code != 'en' and found:
                        return redirect('/edit/activity/translation/{}+{}'.format(classid, l.code))
                    if l.code == lang:
                        found = True
                return redirect('/Activity/{}+{}'.format(classid, lang))

    context = {
        'art' : art,
        'lang' : lang,
        'descr' : descr,
        'name' : name,
        'form' : ArtForm_Trad(initial={'name_it': name, 'descr_it': descr, 'open_time': open_time,})
        #'state':DArtEStato.objects
    }

    return render(request,'editActivityTranslate.html', context)

def filterItemArt(request):
    category_db = ArtCategory.objects.exclude(classid=str(3)).order_by('classid')
    select = [None, True, True, True, True, True, True, True, True]
    art = Art.objects.none()
    category = ArtCategory.objects.none()
    category_t = AArtCategoryArtCategory.objects.none()

    category |= ArtCategory.objects.exclude(classid=str(3))
    category_t |= AArtCategoryArtCategory.objects.exclude(category=str(3))

    for c in category_t:
        new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
        if select[8] and select[7]:
            art |= new_art
        elif select[8]:
            art |= new_art.filter(state='02')
        elif select[7]:
            art |= new_art.filter(state='01')

    if request.method == 'POST':
        category = ArtCategory.objects.none()
        category_t = AArtCategoryArtCategory.objects.none()
        state = DArtEStato.objects.none()
        art = Art.objects.none()
        cat = 0

        for c in range(1, len(category_db) + 1):
            if 'categoria_{}'.format(c) in request.POST:
                cat += 1
                select[c] = True
                category |= ArtCategory.objects.filter(classid=str(c))
                category_t |= AArtCategoryArtCategory.objects.filter(category=str(c))
            else:
                select[c] = False

        if 'attivo' in request.POST:
            cat += 1
            select[7] = True
            state |= DArtEStato.objects.filter(code='01')
        else:
            select[7] = False

        if 'eliminato' in request.POST:
            cat += 1
            select[8] = True
            state |= DArtEStato.objects.filter(code='02')
        else:
            select[8] = False


        for c in category_t:
            new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
            if select[8] and select[7]:
                art |= new_art
            elif select[8]:
                art |= new_art.filter(state='02')
            elif select[7]:
                art |= new_art.filter(state='01')

        context = {
            'art': art,
            'category_t': category_t,
            'category': category,
            'category_db': category_db,
            'select' : select,
        }
    else:
        context = {
            'art': art,
            'category_t': category_t,
            'category': category,
            'category_db': category_db,
            'select': select,
            #'lang' : Lang.objects.get(active=True),
        }

    return render(request, 'filterArt.html', context)

def filterItemTour(request):
    select = [True, True, True, True, True]
    if request.method == 'POST':
        tour = Tour.objects.none()

        if 'tempo' in request.POST:
            select[0] = True
            tour |= Tour.objects.filter(type='a tempo').order_by('name_it')
        else:
            select[0] = False

        if 'tema' in request.POST:
            select[1] = True
            tour |= Tour.objects.filter(type='a tema').order_by('name_it')
        else:
            select[1] = False

        if 'storico' in request.POST:
            select[2] = True
            tour |= Tour.objects.filter(type='storico').order_by('name_it')
        else:
            select[2] = False

        if 'attivo' and not 'eliminato' in request.POST:
            select[3] = True
            tour = tour.filter(state='01')
        elif 'eliminato' and not 'attivo' in request.POST:
            select[3] = False

        if 'eliminato' and not 'attivo' in request.POST:
            select[4] = True
            tour = tour.filter(state='02')
        elif 'attivo' and not 'eliminato' in request.POST:
            select[4] = False

        context = {
            'tour': tour,
            'select': select,
        }
    else:
        context ={
            'tour': Tour.objects.order_by('name_it'),
            'select': select,
        }

    return render(request, 'filterTour.html', context)

def filterItemEvent(request):
    category_db = EventCategory.objects.order_by('classid')
    select = [None, True, True, True, True, True]

    if request.method == 'POST':
        category = EventCategory.objects.none()
        category_t = AEventCategoryEventCategory.objects.none()
        state = DArtEStato.objects.none()
        event = Event.objects.none()
        cat = 0

        for c in range(1, len(category_db) + 1):
            if 'categoria_{}'.format(c) in request.POST:
                cat += 1
                select[c] = True
                category |= EventCategory.objects.filter(classid=str(c))
                category_t |= AEventCategoryEventCategory.objects.filter(category=str(c))
            else:
                select[c] = False

        if 'attivo' in request.POST:
            cat += 1
            select[4] = True
            state |= DArtEStato.objects.filter(code='01')
        else:
            select[4] = False

        if 'eliminato' in request.POST:
            cat += 1
            select[5] = True
            state |= DArtEStato.objects.filter(code='02')
        else:
            select[5] = False


        for c in category_t:
            new_event = Event.objects.filter(name_it=c.event).order_by('name_it')
            if select[5] and select[4]:
                event |= new_event
            elif select[5]:
                event |= new_event.filter(state='02')
            elif select[4]:
                event |= new_event.filter(state='01')

        context = {
            'event': event,
            'category_t': category_t,
            'category': category,
            'category_db': category_db,
            'select' : select,
        }
    else:
        context = {
            'event': Event.objects.order_by('name_it'),
            'category_t': AEventCategoryEventCategory.objects,
            'category': EventCategory.objects.order_by('classid'),
            'category_db': category_db,
            'select': select,
            #'lang' : Lang.objects.get(active=True),
        }

    return render(request, 'filterEvent.html', context)

def filterItemActivity(request):
    select = [None, True, True]
    art = Art.objects.none()
    category = ArtCategory.objects.none()
    category_t = AArtCategoryArtCategory.objects.none()

    # get only activity category
    category |= ArtCategory.objects.filter(classid=str(3))
    category_t |= AArtCategoryArtCategory.objects.filter(category=str(3))

    for c in category_t:
        new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
        if select[2] and select[1]:
            art |= new_art
        elif select[2]:
            art |= new_art.filter(state='02')
        elif select[1]:
            art |= new_art.filter(state='01')

    if request.method == 'POST':
        state = DArtEStato.objects.none()
        art = Art.objects.none()

        if 'attivo' in request.POST:
            select[1] = True
            state |= DArtEStato.objects.filter(code='01')
        else:
            select[1] = False

        if 'eliminato' in request.POST:
            select[2] = True
            state |= DArtEStato.objects.filter(code='02')
        else:
            select[2] = False

        for c in category_t:
            new_art = Art.objects.filter(name_it=c.points).order_by('name_it')
            if select[2] and select[1]:
                art |= new_art
            elif select[2]:
                art |= new_art.filter(state='02')
            elif select[1]:
                art |= new_art.filter(state='01')

        context = {
            'art': art,
            'category_t': category_t,
            'category': category,
            'select' : select,
        }
    else:
        context = {
            'art': art,
            'category_t': category_t,
            'category': category,
            'select': select,
            #'lang' : Lang.objects.get(active=True),
        }

    return render(request, 'filterActivity.html', context)

def newArt(request):
    category = ArtCategory.objects.exclude(classid=str(3)).order_by('classid')

    if request.method == 'POST':
        #classid = request.POST['classid']

        with transaction.atomic():
            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Art.objects.get(classid=id)
                except:
                    art = Art(classid=id)
                    break
            print("codice: ", id)
            form = ArtForm(request.POST, request.FILES, instance=art)

            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Location.objects.get(classid=id)
                except:
                    location = Location(classid=id, address=None, event=art.classid, num='1', geom=None)
                    break
            locationForm = LocationForm(request.POST)

            if form.is_valid() and locationForm.is_valid():
                form.save()

                for file in request.FILES.getlist('path'):
                    while True:
                        try:
                            id = "".join(random.choices(string.digits, k=6))
                            ArtMedia.objects.get(classid=id)
                        except:
                            media = ArtMedia.objects.create(classid=id, path=file, art=art)
                            media.save()
                            break

                latitude = locationForm.cleaned_data['latitude']
                longitude = locationForm.cleaned_data['longitude']
                location.address = locationForm.cleaned_data['address']

                location.geom = Point(float(longitude), float(latitude))
                location.save()
            else:
                if 'open_time' in form.errors:
                    messages.info(request, "Field 'Open time' is too long!")
                    context = {
                        # 'lang': Lang.objects.get(active=True),
                        'form': ArtForm(),
                        'locationForm': LocationForm(),
                        'category': category,
                    }
                    return render(request, 'newArt.html', context)
                elif 'tickets' in form.errors:
                    messages.info(request, "Field 'Tickets' is too long!")
                    context = {
                        # 'lang': Lang.objects.get(active=True),
                        'form': ArtForm(),
                        'locationForm': LocationForm(),
                        'category': category,
                    }
                    return render(request, 'newArt.html', context)

            for c in range(1, len(category) + 1):
                if 'categoria_{}'.format(c) in request.POST:
                    cat = ArtCategory.objects.get(classid=str(c))
                    category_t = AArtCategoryArtCategory(category=cat, points=art)
                    category_t.save()

        return redirect('/edit/translation/{}+{}'.format(art.classid,'en'))

    context = {
        #'lang': Lang.objects.get(active=True),
        'form': ArtForm(),
        'media': ArtMediaForm(),
        'locationForm': LocationForm(),
        'category': category,
    }

    return render(request, 'newArt.html',context)

def newTour(request):
    if request.method == 'POST':
        #classid = request.POST['classid']

        while True:
            try:
                id = "".join(random.choices(string.digits, k=5))
                Tour.objects.get(classid=id)
            except:
                tour = Tour(classid=id)
                break

        form = TourForm(request.POST, request.FILES, instance=tour)

        if form.is_valid():
            with transaction.atomic():
                tour.type = DTourETipoit.objects.get(name=form.cleaned_data['type'])

                form.save()

                for file in request.FILES.getlist('path'):
                    while True:
                        try:
                            id = "".join(random.choices(string.digits, k=6))
                            TourMedia.objects.get(classid=id)
                        except:
                            media = TourMedia.objects.create(classid=id, path=file, tour=tour)
                            media.save()
                            break
        else:
            if 'descr_it' in  form.errors:
                messages.info(request, "Field 'Description' is empty!")
                return redirect('newTour')

        return redirect('/edit/tour/{}/points'.format(id))

    context = {
        'form' : TourForm(),
        'media' : TourMediaForm()
    }

    return render(request, 'newTour.html', context)

def newEvent(request):
    category = EventCategory.objects.order_by('classid')

    # for key, value in request.POST.items():
    #     print(f'Key: {key}')
    #     print(f'Value: {value}')

    if request.method == 'POST':
        #classid = request.POST['classid']

        with transaction.atomic():
            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Event.objects.get(classid=id)
                except:
                    event = Event(classid=id)
                    break

            print("codice: ", id)
            form = EventForm(request.POST, request.FILES, instance=event)

            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Location.objects.get(classid=id)
                except:
                    location = Location(classid=id, address=None, event=event.classid, num='1', geom=None)
                    break
            locationForm = LocationForm(request.POST)

            if form.is_valid() and locationForm.is_valid():
                form.save()

                for file in request.FILES.getlist('path'):
                    while True:
                        try:
                            id = "".join(random.choices(string.digits, k=6))
                            EventMedia.objects.get(classid=id)
                        except:
                            media = EventMedia.objects.create(classid=id, path=file, linked_event=event)
                            media.save()
                            break

                latitude = locationForm.cleaned_data['latitude']
                longitude = locationForm.cleaned_data['longitude']
                location.address = locationForm.cleaned_data['address']

                location.geom = Point(float(longitude), float(latitude))
                location.save()

                num_forms = int(request.POST.get('num-forms'))

                if num_forms > 0:
                    for i in range(0, num_forms):
                        day = request.POST.get('form-{}-day'.format(i))
                        start_time = request.POST.get('form-{}-start_time'.format(i))
                        end_time = request.POST.get('form-{}-end_time'.format(i))

                        if day != '' or start_time != '':
                            if day == '' or start_time == '':
                                messages.info(request, "Day or start time missing!")
                                context = {
                                    'form': EventForm(),
                                    'category': category,
                                }

                                return render(request, 'newEvent.html', context)

                        elif day != ''  and start_time != '':
                            while True:
                                try:
                                    id_calendar = "".join(random.choices(string.digits, k=6))
                                    Calendar.objects.get(classid=id_calendar)
                                except:
                                    calendar = Calendar(classid=id_calendar)
                                    break
                            
                            calendar.event = event
                            calendar.day = day
                            calendar.start_time = start_time
                            if end_time != '':
                                calendar.end_time = end_time

                            calendar.save()
                            
            else:
                if 'tickets' in form.errors:
                    messages.info(request, "Field 'Tickets' is too long!")
                    context = {
                        # 'lang': Lang.objects.get(active=True),
                        'form': EventForm(),
                        'category': category,
                    }
                    return render(request, 'newEvent.html', context)

            for c in range(1, len(category) + 1):   
                if 'categoria_{}'.format(c) in request.POST:
                    cat = EventCategory.objects.get(classid=str(c))
                    category_t = AEventCategoryEventCategory(category=cat, event=event)
                    category_t.save()

        return redirect('/edit/event/translation/{}+{}'.format(event.classid,'en'))

    context = {
        #'lang': Lang.objects.get(active=True),
        'form': EventForm(),
        'media': EventMediaForm(),
        'locationForm': LocationForm(),
        'category': category,
    }

    return render(request, 'newEvent.html', context)

def newActivity(request):
    if request.method == 'POST':
        #classid = request.POST['classid']

        with transaction.atomic():
            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Art.objects.get(classid=id)
                except:
                    art = Art(classid=id)
                    break
            print("codice: ", id)
            form = ArtForm(request.POST, request.FILES, instance=art)

            for file in request.FILES.getlist('path'):
                while True:
                    try:
                        id = "".join(random.choices(string.digits, k=6))
                        ArtMedia.objects.get(classid=id)
                    except:
                        media = ArtMedia.objects.create(classid=id, path=file, art=art)
                        media.save()
                        break

            while True:
                try:
                    id = "".join(random.choices(string.digits, k=5))
                    Location.objects.get(classid=id)
                except:
                    location = Location(classid=id, address=None, event=art.classid, num='1', geom=None)
                    break
            locationForm = LocationForm(request.POST)

            if form.is_valid() and locationForm.is_valid():
                form.save()

                latitude = locationForm.cleaned_data['latitude']
                longitude = locationForm.cleaned_data['longitude']
                location.address = locationForm.cleaned_data['address']

                location.geom = Point(float(longitude), float(latitude))
                location.save()
            else:
                if 'open_time' in form.errors:
                    messages.info(request, "Field 'Open time' is too long!")
                    context = {
                        # 'lang': Lang.objects.get(active=True),
                        'form': ArtForm(),
                        'media': ArtMediaForm(),
                        'locationForm': LocationForm(),
                    }
                    return render(request, 'newActivity.html', context)

            cat = ArtCategory.objects.get(classid=str(3))
            category_t = AArtCategoryArtCategory(category=cat, points=art)
            category_t.save()

        return redirect('/edit/activity/translation/{}+{}'.format(art.classid,'en'))

    context = {
        #'lang': Lang.objects.get(active=True),
        'form': ArtForm(),
        'media': ArtMediaForm(),
        'locationForm': LocationForm(),
    }

    return render(request, 'newActivity.html',context)

def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']

        if password == password2:
            if User.objects.filter(email=email).exists():
                messages.info(request, 'Email already used!')
                return redirect('register')
            elif User.objects.filter(username=username).exists():
                messages.info(request, 'Username already exist!')
                return redirect('register')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save();
                return redirect('logIn')
        else:
            messages.info(request, "Passwords don't match!")
            return redirect('register')
    else:
        return render(request, 'register.html')

def logIn(request):
    if request.method =='POST':
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)

        if user is not None:
            auth.login(request, user)
            return redirect('/')
        else:
            messages.info(request, 'Authentication failed!')
            return redirect('logIn')
    else:
        return render(request, 'login.html')

def logOut(request):
    auth.logout(request)
    return redirect('/')

