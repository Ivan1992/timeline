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
            style: "color: blue",
        },
        { 
            id: 2,
            content: 'Старообрядческие архиереи',
            className: 'rdc-group',
            style: "color:red"
        }
    ];

    var options = {
        zoomable: false,
        horizontalScroll: true,
        verticalScroll: true,
        showMajorLabels: false,
        showMinorLabels: true,
        width: "100%",
        zoomMin: 315400000000,
        zoomMax: 12616000000000,
        align: 'left',
        max: new Date(new Date().getFullYear() + 100 + '-01-01'),
        min: new Date('1500-01-01'),
        /* min: new Date('900-01-01'), */
        showCurrentTime: false,
        template: function (item, element, data) {
            return '<span class="label">' + data.start.getFullYear() + (data.end ? '-' + data.end.getFullYear() : '') + ': ' + item.content + '</span><div class="line" style="' + (data.end ? '' : 'width:5px;') + '"></div>' +
                '<div class="popover fade bs-popover-bottom show" role="tooltip" x-placement="bottom"><div class="arrow"></div><h3 class="popover-header">' + item.start + ": " + item.content + '</h3> <div class="popover-body">' + item.description + '</div></div>';
        },
        orientation: { axis: 'top', item: 'top' },
    };

    var timeline;

    function refresh(first = false) {
        db.collection("items").get().then((querySnapshot) => {
            items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            items = new vis.DataSet(items);
            if (first) {
                timeline = new vis.Timeline(container, items, groups, options);
            } else {
                timeline.setItems(items);
            }
            /* timeline.setOptions({autoResize: false}); */
        });
    }
    refresh(true);

    $("#zoomIn").on("click", function () {
        timeline.zoomIn(0.8, { animnation: true });
    });
    $("#zoomOut").on("click", function () {
        timeline.zoomOut(0.8, { animnation: true });
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

    var header, offset;
    
    $(window).scroll(function () {
        if (offset == undefined) {
            header = $(".vis-panel.vis-top");
            offset = $(".vis-panel.vis-top").offset();
            return;
        } 

        var scroll = $(window).scrollTop();
        if (scroll >= offset.top) {
            header.addClass("sticky");
            axis.addClass("sticky");
        } else {
            header.removeClass("sticky");
            axis.removeClass("sticky");
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

    $("#resize").on("click", () => {
        timeline.redraw();
        timeline.setOptions({autoResize: false});
    })

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