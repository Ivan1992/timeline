(function(){
    var showSectionTitles = true;

        //console.log(timelineData);

    var timelineWrap = $('.timelineWrap'),
        timelineHeader = timelineWrap.find('.timelineHeader'),
        timelineLegend = timelineHeader.find('.legend'),
        timelineLegendList = timelineLegend.find('.list'),
        timelineScale = timelineHeader.find('.scale .list a'),
        timelineCanvas = timelineWrap.find('.timelineCanvas'),
        timelineThumb = timelineCanvas.next('.timelineThumb');

    var updateLegend = function(data){
        timelineLegendList.empty();
        timelineLegend.toggle(data.length > 1);

        $.each(data, function(i, section){
            if (typeof timeline.showSections[i] === 'undefined')
                timeline.showSections[i] = true;

            var li = $('<li>');
            var label = $('<label>', {text: section.name}).prependTo(li);
            var dot = $('<span>', {'class': 'dot'}).css({backgroundColor: section.color}).prependTo(label);
            var checkbox = $('<input>', {type: 'checkbox'}).prop('checked', timeline.showSections[i]).prependTo(label);

            checkbox.change(function(){
                timeline.showSections[i] = !timeline.showSections[i];
                timeline.showAll = $.inArray(true, timeline.showSections) === -1;
                timeline.updateRange();
                timeline.draw();
            });

            li.appendTo(timelineLegendList);
        });
        timeline.sectionTitles.toggle(showSectionTitles);
    };

    var timeline = new Timeline({
        data: timelineData,
        el: timelineCanvas,
        thumbEl: timelineThumb,
        fastDraw: true,
        zoom: 2,
        onDataLoad: updateLegend
    });

    updateLegend(timelineData);

    timelineScale.click(function(e){
        e.preventDefault();

        var center = (timeline.el[0].scrollLeft+timeline.el[0].clientWidth/2)/timeline.el[0].scrollWidth;
        timeline.setZoom(parseInt($(this).data('zoom'), 10));
        timeline.el[0].scrollLeft = timeline.el[0].scrollWidth*center-timeline.el[0].clientWidth/2;
    });

    timelineCanvas.scroll(function(e){
        timeline.yearsList[0].style.top = this.scrollTop+'px';
        timeline.sectionTitles.css('left', this.scrollLeft);
        timeline.updateLabelsPos();
    });

    var $document = $(document);
    var timelineCanvasStartX = 0;
    var timelineCanvasStartY = 0;
    var timelineCanvasMove = function(e){
        timelineCanvas[0].scrollLeft = timelineCanvasStartX-e.pageX;
        timelineCanvas[0].scrollTop = timelineCanvasStartY-e.pageY;
    };

    timelineCanvas.click(function(e){
        e.stopPropagation();
    }).mousedown(function(e){
        e.preventDefault();

        timelineCanvasStartX = this.scrollLeft+e.pageX;
        timelineCanvasStartY = this.scrollTop+e.pageY;
        
        timelineCanvas[0].style.cursor = 'move';
        $document.on('mousemove', timelineCanvasMove).one('mouseup', function(e){
            $document.off('mousemove', timelineCanvasMove);
            timelineCanvas[0].style.cursor = '';
        });
    });

    $document.on('keydown', function(e){
        switch (e.which) {
            case 37: // left
                timelineCanvas[0].scrollLeft -= 10;
                break;
            case 38: // up
                timelineCanvas[0].scrollTop -= 10;
                break;
            case 39: // right
                timelineCanvas[0].scrollLeft += 10;
                break;
            case 40: // down
                timelineCanvas[0].scrollTop += 10;
                break;
        }
    });

    timelineHeader.find('.sectionTitlesButton').click(function(e){
        e.preventDefault();
        showSectionTitles = !showSectionTitles;
        $(this).toggleClass('down', showSectionTitles);
        timeline.sectionTitles.toggle(showSectionTitles);
    });
})();