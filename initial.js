(function() {
  var showSectionTitles = true;

  const http = new XMLHttpRequest();
  const tok = "qcarnwXClkOkzzaM5E4miBW1";
  const tok2 = "07GyU_GNSuuDEATM";
  const spc = "urwi2cb4sy5x";
  const url = `https://cdn.contentful.com/spaces/${spc}/environments/master/entries?access_token=${tok}__${tok2}&include=10&content_type=section`;

  var timelineData = [];
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var parsed = JSON.parse(http.responseText);
      var includes = parsed.includes["Entry"];
      var asset = parsed.includes["Asset"];
      var arr = parsed.items.map(item => item.fields);
      arr.forEach(section => {
        section.items = section.items.map(
          item => includes.find(entry => entry.sys.id === item.sys.id).fields
        );
        section.items = section.items.map(item =>
          item.image
            ? {
                ...item,
                image: asset.find(entry => entry.sys.id === item.image.sys.id)
                  .fields.file.url
              }
            : item
        ); //image urls
      });
      timeline.setData(arr);
      timeline.onDataLoad(arr);
      timeline.draw();

      arr.forEach((section, index) => {
        //if (section.items.filter(x => x.fulltext).length > 0) {
        var div = $("<div>", { id: `section${index}`, class: "modalWrapper" });
        div
          .html(
            `<div class="close-section${index} closeDiv"></div><div class="modal-content"></div>`
          )
          .prependTo("body");
        $(`.section${index}Link`).animatedModal({ color: section.color });
        div.css("background-color", "#bbb");
        div.css(
          "background-image",
          `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 52 52'%3E%3Cpath fill='%23${section.color.slice(
            1
          )}' fill-opacity='0.1' d='M0 17.83V0h17.83a3 3 0 0 1-5.66 2H5.9A5 5 0 0 1 2 5.9v6.27a3 3 0 0 1-2 5.66zm0 18.34a3 3 0 0 1 2 5.66v6.27A5 5 0 0 1 5.9 52h6.27a3 3 0 0 1 5.66 0H0V36.17zM36.17 52a3 3 0 0 1 5.66 0h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 0 1 0-5.66V52H36.17zM0 31.93v-9.78a5 5 0 0 1 3.8.72l4.43-4.43a3 3 0 1 1 1.42 1.41L5.2 24.28a5 5 0 0 1 0 5.52l4.44 4.43a3 3 0 1 1-1.42 1.42L3.8 31.2a5 5 0 0 1-3.8.72zm52-14.1a3 3 0 0 1 0-5.66V5.9A5 5 0 0 1 48.1 2h-6.27a3 3 0 0 1-5.66-2H52v17.83zm0 14.1a4.97 4.97 0 0 1-1.72-.72l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1 0-5.52l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43c.53-.35 1.12-.6 1.72-.72v9.78zM22.15 0h9.78a5 5 0 0 1-.72 3.8l4.44 4.43a3 3 0 1 1-1.42 1.42L29.8 5.2a5 5 0 0 1-5.52 0l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1-.72-3.8zm0 52c.13-.6.37-1.19.72-1.72l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43a5 5 0 0 1 5.52 0l4.43-4.43a3 3 0 1 1 1.42 1.41l-4.44 4.43c.36.53.6 1.12.72 1.72h-9.78zm9.75-24a5 5 0 0 1-3.9 3.9v6.27a3 3 0 1 1-2 0V31.9a5 5 0 0 1-3.9-3.9h-6.27a3 3 0 1 1 0-2h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 1 1 2 0v6.27a5 5 0 0 1 3.9 3.9h6.27a3 3 0 1 1 0 2H31.9z'%3E%3C/path%3E%3C/svg%3E")`
        );
        //}
      });
      /* $("a.modals").each( function(i,obj) { 
                var color = $(this).parents("div.section").find("div.section-bg").css("backgroundColor");
                $(this).animatedModal({color: color});
            }); */
    }
  };

  http.open("GET", url);
  http.send();

  var timelineWrap = $(".timelineWrap"),
    timelineHeader = timelineWrap.find(".timelineHeader"),
    timelineLegend = timelineHeader.find(".legend"),
    timelineLegendList = timelineLegend.find(".list"),
    timelineScale = timelineHeader.find(".scale .list a"),
    timelineCanvas = timelineWrap.find(".timelineCanvas"),
    timelineThumb = timelineCanvas.next(".timelineThumb");

  var updateLegend = function(data) {
    timelineLegendList.empty();
    timelineLegend.toggle(data.length > 1);

    $.each(data, function(i, section) {
      if (typeof timeline.showSections[i] === "undefined")
        timeline.showSections[i] = true;

      var li = $("<li>");
      var label = $("<label>", { text: section.name }).prependTo(li);
      var dot = $("<span>", { class: "dot" })
        .css({ backgroundColor: section.color })
        .prependTo(label);
      var checkbox = $("<input>", { type: "checkbox" })
        .prop("checked", timeline.showSections[i])
        .prependTo(label);

      checkbox.change(function() {
        timeline.showSections[i] = !timeline.showSections[i];
        timeline.showAll = $.inArray(true, timeline.showSections) === -1;
        timeline.updateRange();
        timeline.draw();
      });

      li.appendTo(timelineLegendList);
    });
    if (timeline.sectionTitles)
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

  timelineScale.click(function(e) {
    e.preventDefault();

    var center =
      (timeline.el[0].scrollLeft + timeline.el[0].clientWidth / 2) /
      timeline.el[0].scrollWidth;
    timeline.setZoom(parseInt($(this).data("zoom"), 10));
    timeline.el[0].scrollLeft =
      timeline.el[0].scrollWidth * center - timeline.el[0].clientWidth / 2;
  });

  timelineCanvas.scroll(function(e) {
    timeline.yearsList[0].style.top = this.scrollTop + "px";
    timeline.sectionTitles.css("left", this.scrollLeft);
    timeline.updateLabelsPos();
  });

  var $document = $(document);
  var timelineCanvasStartX = 0;
  var timelineCanvasStartY = 0;
  var timelineCanvasMove = function(e) {
    timelineCanvas[0].scrollLeft = timelineCanvasStartX - e.pageX;
    timelineCanvas[0].scrollTop = timelineCanvasStartY - e.pageY;
  };

  const touchTimelineMove = function(e) {
    timelineCanvas[0].scrollLeft =
      timelineCanvasStartX - e.originalEvent.touches[0].pageX;
    timelineCanvas[0].scrollTop =
      timelineCanvasStartY - e.originalEvent.touches[0].pageY;
  };

  timelineCanvas
    .click(function(e) {
      e.stopPropagation();
    })
    .mousedown(function(e) {
      e.preventDefault();

      timelineCanvasStartX = this.scrollLeft + e.pageX;
      timelineCanvasStartY = this.scrollTop + e.pageY;

      timelineCanvas[0].style.cursor = "move";
      $document.on("mousemove", timelineCanvasMove).one("mouseup", function(e) {
        $document.off("mousemove", timelineCanvasMove);
        timelineCanvas[0].style.cursor = "";
      });
    });

  timelineCanvas.on("touchstart", function(e) {
    timelineCanvasStartX = this.scrollLeft + e.originalEvent.touches[0].pageX;
    timelineCanvasStartY = this.scrollTop + e.originalEvent.touches[0].pageY;
    $document.on("touchmove", touchTimelineMove).one("touchend", function(e) {
      $document.off("touchmove", touchTimelineMove);
    });
  });

  /*   timelineCanvas.on("touchstart", e => {
    alert("asd");
  }); */

  /* timelineCanvas.hammer().bind("panleft panright",function(ev) {
        timelineCanvasMove({pageX: ev.gesture.center.x + ev.gesture.deltaX, pageY: ev.gesture.center.y + ev.gesture.deltaY})
    });
    timelineCanvas.hammer().bind("pandown",function(ev) {
        timelineCanvasStartX = timelineCanvas[0].scrollLeft+ev.gesture.center.x + ev.gesture.deltaX;
        timelineCanvasStartY = timelineCanvas[0].scrollTop+ev.gesture.center.y + ev.gesture.deltaY;
    }); */

  $document.on("keydown", function(e) {
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

  timelineHeader.find(".sectionTitlesButton").click(function(e) {
    e.preventDefault();
    showSectionTitles = !showSectionTitles;
    $(this).toggleClass("down", showSectionTitles);
    timeline.sectionTitles.toggle(showSectionTitles);
  });
})();
