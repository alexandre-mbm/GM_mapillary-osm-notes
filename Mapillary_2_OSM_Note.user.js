// ==UserScript==
// @name        Mapillary 2 OSM Note
// @namespace   http://userscripts.org/users/69817
// @include     http://www.mapillary.com/map/im/*
// @include     http://www.openstreetmap.org/note/new#map=18/*/*&layers=N
// @version     1
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// ==/UserScript==

/*

Copyright (c) 2014 Alexandre Magno <alexandre.mbm@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

function OpenInNewTab(url) {
    var win = window.open(url);
    win.focus();
}

function setData() {

    //var id_photo = (window.location+'').match(/\/([^\/]*)$/)[1];
    var id_photo = (window.location+'').split('/')[5];

    var mapillaryAPI;
    mapillaryAPI = 'http://api.mapillary.com/v1/im/';
    mapillaryAPI = mapillaryAPI+''+id_photo;

    GM_xmlhttpRequest({
        method: 'GET',
        url: mapillaryAPI,
        onload: function(response) {

            var myJson = response.responseText;        
            var jsonObj = $.parseJSON (myJson);
            
            var osm_note_URL;
            osm_note_URL = 'http://www.openstreetmap.org/';
            osm_note_URL = osm_note_URL + 'note/new#map=18/';
            osm_note_URL = osm_note_URL + jsonObj.lat+'/'+jsonObj.lon;
            osm_note_URL = osm_note_URL + '&layers=N';

            //alert(osm_note_URL);
            
            $.each(jsonObj.map_image_versions, function(i, v) {
                if (v.name == 'thumb-320') {
                    GM_setValue('mapillary_320', v.url);
                    return;
                }
                if (v.name == 'thumb-2048') {
                    GM_setValue('mapillary_2048', v.url);
                    return;
                }
            });
         
            GM_setValue('mapillary_link', 'http://www.mapillary.com/map/im/'+id_photo);
            
            GM_setValue('mapillary_coord', jsonObj.lat+'/'+jsonObj.lon);
            
            // TODO uniq variables to support multiples tabs (?)
            
            //OpenInNewTab(osm_note_URL);
            
            //alert($('#GM_create_osm_note'));
            //alert($('#GM_create_osm_note')[0]);

            if(!$('#GM_create_osm_note')[0])
            {
                createLink('');
            }
            else
            {
                $('#GM_create_osm_note_HIDE').attr({
                    href: osm_note_URL
                });

                $('#GM_create_osm_note_HIDE')[0].click();
            }
        }
    });
}

function createLink(osm_note_URL) {

    $('<span/>').text(' | Plugin: ').appendTo($('div.date.ng-binding')[0]);

    $('<a/>',
        {
            href: osm_note_URL,
            target: '_blank',
            id: 'GM_create_osm_note'
        }
    )
    .text('Criar Nota no OpenStreetMap!')
    .on('click', function(e) { e.preventDefault(); setData(); } )
    .appendTo($('div.date.ng-binding')[0]);

    $('<a/>',
        {
            href: osm_note_URL,
            target: '_blank',
            id: 'GM_create_osm_note_HIDE',
            style: 'visibility:hidden;'
        }
    )
    .text('')
    .appendTo($('div.date.ng-binding')[0]);

}

if((window.location+'').match(/.*www\.openstreetmap\.org\/note\/new#map=18\/[^\/]*\/[^\/]*&layers=N/))
{   
    var a_close = $('#sidebar_content h2 a');    
    $('#sidebar_content h2').html(a_close);
    $('#sidebar_content h2').append('Criando nota para foto do Mapillary');
    
    $('div.note p.warning').html('<p>Não mova o marcador de lugar, pois ele está na posição exata da foto. <b>Não apague o link para o Mapillary</b>. A nota é textual e não embute a foto abaixo.</p><p><i>(Por favor não coloque informações pessoais aqui)</i></p>');
    
    var text = 'Nota baseada numa foto do Mapillary:\n\n';
    text = text + GM_getValue('mapillary_link')+'\n\n';
    
    $( "textarea[name='text']" ).val( text );

    var a_img = $('<a/>',
        {
            href: GM_getValue('mapillary_2048'),
            target: '_blank'
        }
    );
    
    $('<img/>',
        {
            src: GM_getValue('mapillary_320'),
            style: 'margin-left:15px'
        }
    ).appendTo(a_img);
    
    a_img.appendTo('#sidebar_content');

/*
<div class="note browse-section">
  <p class="warning">Encontrou um erro ou tem algo faltando? Avise os outros mapeadores para que eles possam consertar. Mova o marcador para a posição correta e digite uma nota para com a explicação do problema. (Por favor não coloque informações pessoais aqui)</p>
  <form action="#">
    <input name="lon" type="hidden">
    <input name="lat" type="hidden">
    <textarea class="comment" name="text" cols="40" rows="10"></textarea>
    <div class="buttons clearfix">
      <input name="add" value="Adicionar nota" type="submit">
    </div>
  </form>
</div>
*/

}
else
{
    //GM_registerMenuCommand('Mapillary 2 OSM Note', show, 'h');
    setData();
}


/*

 http://jsonformatter.bugz.fr/
 
 http://api.mapillary.com/v1/im/BW7wSuFBI_8Z2NGEexWLWg
 
*/

