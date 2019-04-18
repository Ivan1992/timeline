$(function () {

    var config = {
        apiKey: "",
        authDomain: "rpsc-spb.firebaseapp.com",
        databaseURL: "https://rpsc-spb.firebaseio.com",
        projectId: "rpsc-spb",
        storageBucket: "rpsc-spb.appspot.com",
        messagingSenderId: "854445896107"
    };
    firebase.initializeApp(config);
    var db = firebase.firestore();


    var container = document.getElementById('visualization');
    var items = new vis.DataSet([]);
    var loggedIn = false;

    var groups = [
        {
            id: 1,
            content: 'Раскол',
            className: 'rpsc-group',
            style: "color: red",
        },
        { id: 2, content: 'Старообрядческие архиереи', className: 'rdc-group', }
    ];

    var options = {
        zoomable: true,
        horizontalScroll: true,
        showMajorLabels: false,
        showMinorLabels: true,
        width: "100%",
        /* maxMinorChars: 7, */
        /* timeAxis: { scale: 'year', step: 10 }, */
        zoomMin: 315400000000,
        /* zoomMin: 315400000000, */
        zoomMax: 12616000000000,
        /* zoomMax: 6308000000000, */
        align: 'left',
        max: new Date(new Date().getFullYear() + 100 + '-01-01'),
        min: new Date('900-01-01'),
        showCurrentTime: false,
        template: function (item, element, data) {
            return '<span class="label">' + data.start.getFullYear() + (data.end ? '-' + data.end.getFullYear() : '') + ': ' + item.content + '</span><div class="line" style="' + (data.end ? '' : 'width:5px;') + (data.group && data.group === 2 ? 'background-color: rgb(0, 248, 245);' : 'background-color: rgb(255, 108, 162);') + '"></div>' +
                '<div class="popover fade bs-popover-bottom show" role="tooltip" x-placement="bottom"><div class="arrow"></div><h3 class="popover-header">' + item.start + ": " + item.content + '</h3> <div class="popover-body">' + item.description + '</div></div>';
        },
        orientation: { axis: 'top', item: 'top' },
        /*  configure: (option, path) => { return option === 'format' || path.indexOf('format') !== -1 || option === "maxMinorChars" || option === "timeAxis" || path.indexOf('timeAxis') !== -1; }, */
    };

    var timeline;// = new vis.Timeline(container, items, groups, options);

    function refresh(first=false) {
        db.collection("items").get().then((querySnapshot) => {
            items = [];
            querySnapshot.forEach((doc) => {
                items.push({id: doc.id, ...doc.data()});
            });
            items = new vis.DataSet(items);
            if (first) {
                timeline = new vis.Timeline(container, items, groups, options);
            } else {
                timeline.setItems(items);
            }
        });
    }
    refresh(true);

    $("#zoomIn").on("click", function () {
        timeline.zoomIn(0.2, { animnation: true });
    });
    $("#zoomOut").on("click", function () {
        timeline.zoomOut(0.2, { animnation: true });
    });
    $("#changeTooltipMode").change(function () {
        if (this.checked) {
            $(".popover").css("position", "relative");
            $(".popover").css("top", "0");
            timeline.redraw();
        } else {
            $(".popover").css("position", "absolute");
            $(".popover").css("top", "32px");
            timeline.redraw();
        }
    });


    $(document).on("click", ".vis-item-content", function () {
        $(this).find(".popover").toggle();
        var q = $(this).find(".popover");
        $(".vis-item-content").not(this).find(".popover").css("display", "none");
        timeline.redraw();
    });

    $("#addEvent").on("click", function () {
         if (!loggedIn) return;

         var item = { content: $("input#content").val(), start: $("input#start").val(), description: $("textarea#description").val(), group: $("select#group").val() };
         if ($("input#end").val().trim() !== "") {
             item.end = $("input#end").val();
         }
         console.log(item);
         db.collection("items").add(item).then(docRef => {
             refresh();
         })
    });

    $("#login").on("click", () => {
        checkPw($("#pw").val().trim());
    });

    function checkPw(pw) {
        db.collection("allowed").get().then((querySnapshot) => {
            querySnapshot.forEach(doc => {
                if (pw === doc.data().value) {
                    loggedIn = true;
                    $("#login").removeClass("btn-danger");
                    $("#login").addClass("btn-success");
                    $("#login").text("Готово");
                    $("#login").blur();
                    $("#addRow").css("visibility", "visible");
                    $("#loginRow").toggle();
                    return;
                }
            });
            if (!loggedIn) {
                $("#login").addClass("btn-danger");
                $("#login").removeClass("btn-success");
                $("#login").text("Войти");
                $("#login").blur();
            }
            return loggedIn;
        });
    }
});