
var CKAN = CKAN || {};

CKAN.DguSpatialEditor = function($) {

    var geojsonFormat = new ol.format.GeoJSON()
    var selectionListener //

    // Bounding box of our TMS that define our area of interest
    // Extent of the map in units of the projection
    var extent = [-30, 48.00, 3.50, 64.00];

    // Fixed resolutions to display the map at (pixels per ground unit)
    var resolutions = [0.03779740088, 0.02519826725, 0.01259913362, 0.00251982672, 0.00062995668, 0.000188987];

    // Define British National Grid Proj4js projection (copied from http://epsg.io/27700.js)
    //proj4.defs("EPSG:27700","+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");
    proj4.defs("EPSG:4258", "+title=ETRS89 +proj=longlat +ellps=GRS80 +no_defs");

    var bng = ol.proj.get('EPSG:4258');
    bng.setExtent(extent);

    // Define a TileGrid to ensure that WMS requests are made for
    // tiles at the correct resolutions and tile boundaries
    var tileGrid = new ol.tilegrid.TileGrid({
        origin: extent.slice(0, 2),
        resolutions: resolutions,
        tileSize: 250
    });

    // Create layer to hold the dataset bbox
    var selectBoxSource = new ol.source.Vector();
    var selectionLayer = new ol.layer.Vector({
        source: selectBoxSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({color: 'rgba(0, 0, 255, 0.2)'}),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 255, 0.6)',
                width: 3
            })
        })
    });


    var map = new ol.Map({
        target: 'map',
        size: [400,300],
        layers: [
            new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    //TODO : should the OS key stay here?
                    url: 'http://osinspiremappingprod.ordnancesurvey.co.uk/geoserver/gwc/service/wms?key=0822e7b98adf11e1a66e183da21c99ac',
                    params: {
                        'LAYERS': 'InspireETRS89',
                        'FORMAT': 'image/png',
                        'TILED': true,
                        'VERSION': '1.1.1'
                    },
                    tileGrid: tileGrid
                })
            }),
            //vector,
            selectionLayer
        ],
        view: new ol.View({
            projection: bng,
            resolutions: resolutions,
            center: [-0.6680291327536106, 51.33129296535873],
            zoom: 3
        })
    });

    // Interaction to draw a bbox
    var boundingBoxInteraction = new ol.interaction.DragBox({
        condition: ol.events.condition.always,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 255, 1]
            })
        })
    })


    boundingBoxInteraction.on('boxend', function (e) {
        var newBox = boundingBoxInteraction.getGeometry()
        selectBoxSource.addFeature(new ol.Feature(newBox))
        map.removeInteraction(boundingBoxInteraction);
        selectionListener && selectionListener(JSON.stringify(geojsonFormat.writeGeometry(newBox)))
    })

    var selectButton = $("<div class='selectButton ol-unselectable ol-control ol-collapsed' style='top: 4em; left: .5em;'><button class='ol-has-tooltip' type='button'><span>[]</span><span role='tooltip'>Draw Selection</span></button></div>")
    $(".ol-viewport").append(selectButton)
    selectButton.click(function (e) {
        selectBoxSource.clear()
        map.addInteraction(boundingBoxInteraction)
    })

    // important : this forces the refresh of the map when the tab is displayed. Short of that, the map is not displayed because the original offsetSize is null.
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.id == "section-geographic") {
            map.updateSize()
            map.getView().fitExtent(selectBoxSource.getExtent(), map.getSize())
        }

    })


    return {
        setBBox: function(jsonGeom) {
            var geom = geojsonFormat.readGeometry(jsonGeom)
            selectBoxSource.addFeature(new ol.Feature(geom))
            map.getView().fitExtent(selectBoxSource.getExtent(), map.getSize())
        },

        onBBox: function(listener) {
            selectionListener = listener
        },

        bindInput: function(el) {
            var $el = $(el)
            CKAN.DguSpatialEditor.setBBox($el.val())
            CKAN.DguSpatialEditor.onBBox(function(bbox) {
                $el.val(bbox)
            })
        }
    }
} (jQuery)