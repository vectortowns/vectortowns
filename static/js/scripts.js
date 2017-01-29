"use strict";

$('.button-collapse').sideNav({
    menuWidth: 240,
    edge: 'right',
    closeOnClick: true,
    draggable: true
});

function changeLocale(locale) {
    if (locale) {
        $.post("/configure/locale", {locale: locale}, function(json){
            var object = JSON.parse(json);
            if (object.error) {
                Materialize.toast(object.msg, 4000);
            } else {
                location.reload();
            }
        });
    }
};