from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(Art)
admin.site.register(Calendar)
admin.site.register(Event)
admin.site.register(EventMedia)
admin.site.register(Location)
admin.site.register(ArtMedia)
admin.site.register(News)
admin.site.register(Rss)
admin.site.register(Tour)
admin.site.register(TourMedia)

admin.site.register(AArtCategoryArtCategory)
admin.site.register(AArtTourTour)
admin.site.register(AEventCategoryEventCategory)
admin.site.register(ArtCategory)
admin.site.register(ArtCategoryNameTradT)
admin.site.register(ArtDescrTradT)
admin.site.register(ArtNameTradT)
admin.site.register(ArtTradT)

admin.site.register(DArtEStato)
admin.site.register(DELang)
admin.site.register(DRssEState)
admin.site.register(DTourETipoit)

admin.site.register(EventCategory)
admin.site.register(EventCategoryNameTradT)
admin.site.register(EventDescrTradT)
admin.site.register(EventNameTradT)

admin.site.register(NewsDescrTradT)
admin.site.register(NewsTitleTradT)

admin.site.register(RssCategory)
admin.site.register(RssTextTradT)
admin.site.register(RssTitleTradT)
admin.site.register(RssWhenDescrTradT)
admin.site.register(RssWhenIs)
admin.site.register(RssWhereIs)

admin.site.register(SpatialRefSys)

admin.site.register(TourNameTradT)
admin.site.register(TourDescrTradT)
