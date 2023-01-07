/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
    var registeredInModuleLoader;
    if (typeof define === 'function' && define.amd) {
        define(factory);
        registeredInModuleLoader = true;
    }
    if (typeof exports === 'object') {
        module.exports = factory();
        registeredInModuleLoader = true;
    }
    if (!registeredInModuleLoader) {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
            window.Cookies = OldCookies;
            return api;
        };
    }
}(function () {
    function extend () {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[ i ];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    function decode (s) {
        return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
    }

    function init (converter) {
        function api() {}

        function set (key, value, attributes) {
            if (typeof document === 'undefined') {
                return;
            }

            attributes = extend({
                path: '/'
            }, api.defaults, attributes);

            if (typeof attributes.expires === 'number') {
                attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
            }

            // We're using "expires" because "max-age" is not supported by IE
            attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

            try {
                var result = JSON.stringify(value);
                if (/^[\{\[]/.test(result)) {
                    value = result;
                }
            } catch (e) {}

            value = converter.write ?
                converter.write(value, key) :
                encodeURIComponent(String(value))
                    .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

            key = encodeURIComponent(String(key))
                .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
                .replace(/[\(\)]/g, escape);

            var stringifiedAttributes = '';
            for (var attributeName in attributes) {
                if (!attributes[attributeName]) {
                    continue;
                }
                stringifiedAttributes += '; ' + attributeName;
                if (attributes[attributeName] === true) {
                    continue;
                }

                // Considers RFC 6265 section 5.2:
                // ...
                // 3.  If the remaining unparsed-attributes contains a %x3B (";")
                //     character:
                // Consume the characters of the unparsed-attributes up to,
                // not including, the first %x3B (";") character.
                // ...
                stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
            }

            return (document.cookie = key + '=' + value + stringifiedAttributes);
        }

        function get (key, json) {
            if (typeof document === 'undefined') {
                return;
            }

            var jar = {};
            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all.
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var cookie = parts.slice(1).join('=');

                if (!json && cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    var name = decode(parts[0]);
                    cookie = (converter.read || converter)(cookie, name) ||
                        decode(cookie);

                    if (json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) {}
                    }

                    jar[name] = cookie;

                    if (key === name) {
                        break;
                    }
                } catch (e) {}
            }

            return key ? jar[key] : jar;
        }

        api.set = set;
        api.get = function (key) {
            return get(key, false /* read as raw */);
        };
        api.getJSON = function (key) {
            return get(key, true /* read as json */);
        };
        api.remove = function (key, attributes) {
            set(key, '', extend(attributes, {
                expires: -1
            }));
        };

        api.defaults = {};

        api.withConverter = init;

        return api;
    }

    return init(function () {});
}));

(function ($) {
    "use strict";

    // Initialize Firebase
    var firebaseConfig = {
        apiKey: "AIzaSyBxWp3j7o_a-S-wU4d5Rq2tMY78qD4nao4",
        authDomain: "tuson-vn.firebaseapp.com",
        databaseURL: "https://tuson-vn.firebaseio.com",
        projectId: "tuson-vn",
        storageBucket: "tuson-vn.appspot.com",
        messagingSenderId: "631273005996",
    };
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();

    var is_login = false;

    if(Cookies.get('dpv_is_logged') == 'yes'){
        is_login = true;
        $('body').addClass('loggedin').removeClass('open-ppl');
        $('button.btn-login').attr('data-old-text', $('button.btn-login').html()).html('Đăng xuất').addClass('btn-logout');
        $('button.btn-config').removeClass('hidden');
    }

    var w_data = {
        database: null,
        currentUser: null,
        Users: null,
        arrUsers: null,
        bad_code: [4, 13, 14, 44, 49, 53, 144, 149, 153],
        keep_code: [68, 86, 66, 88, 99, 79, 74, 87],
        exist_code: [],
        limit: 200
    };


    var timer_rolling = null;

    const UserSchema = {
        bks: '',
        code: '',
        fb: '',
        fburl: '',
        phone: '',
        name: '',
        size: '',
        zone: '',
        address: '',
        dateCreate: ''
    }

    var tblAdmin = database.ref().child('tblAdmin');
    var tblConfig = database.ref().child('tblConfig');
    var tblUser = database.ref().child('tblUser');

    window.DPVDATA = w_data;

    const getConfigs = () => {
        tblConfig.on('value', function (snapshot){
            var c_data = snapshot.val();
            w_data.limit = c_data.limit;
            w_data.bad_code = c_data.bad_code.length > 0 ? c_data.bad_code.split(',').map(x=>+x) : [];
            w_data.keep_code = c_data.exist_code.length > 0 ? c_data.exist_code.split(',').map(x=>+x) : [];
            console.log(c_data);
        });
    }
    getConfigs();

    const resetRGF = () => {
        $('.frm-row .frm-input').val('').removeAttr('readonly');
    }

    const getExistCode = () => {
        tblUser.orderByChild('code').on('value', function (snapshot) {
            w_data.exist_code = w_data.keep_code.concat([]);
            snapshot.forEach(data => {
                let _tmp = data.val(),
                    _code = parseInt(_tmp.code);
                if (w_data.exist_code.indexOf(_code) == -1) {
                    w_data.exist_code.push(_code);
                }
            });
        })
    }

    getExistCode();

    const dateFormat = (val) => {
        var months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
        var days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        var d = new Date(val);
        var day = days[d.getDay()];
        var hr = d.getHours();
        var min = d.getMinutes();
        if (min < 10) {
            min = "0" + min;
        }
        var ampm = "sáng";
        if (hr > 12) {
            hr -= 12;
            ampm = "chiều";
        }
        var date = d.getDate();
        //var month = months[d.getMonth()];
        var month = d.getMonth() + 1;
        var year = d.getFullYear();

        return d.getHours() + ':' + min + ' ' + date + '/' + month + '/' + year;

        //return day + " " + hr + ":" + min + ampm + " " + date + " " + month + " " + year;
    }

    const arrayReverseObj =  obj => Object.keys(obj).sort().reverse().map(key=> ({...obj[key],key:key}) );

    const getUser = () => {
        tblUser.on('value', function (snapshot) {
            var _html = '';
            w_data.Users = snapshot.val();
            if(snapshot.val()){
                w_data.arrUsers = arrayReverseObj(snapshot.val());
                var i = w_data.arrUsers.length + 1;
                w_data.arrUsers.forEach(data => {
                    let user = data,
                        code = parseInt(user.code),
                        address = user.address ? user.address : '-';
                    i--;
                    _html += '<tr data-id="' + data.key + '">';
                    _html += '<td>' + i + '</td>';
                    _html += '<td>' + user.name + '</td>';
                    _html += '<td><a href="#">' + user.fb + '</a></td>';
                    _html += '<td>' + user.bks + '</td>';
                    _html += '<td>' + (code < 10 ? '0' : '') + code + '</td>';
                    _html += '<td>' + user.phone + '</td>';
                    _html += '<td>' + user.zone + '</td>';
                    _html += '<td>' + user.size + '</td>';
                    _html += '<td>' + address + '</td>';
                    _html += '<td>' + dateFormat(user.dateCreate) + '</td>';
                    _html += '<td><button class="btn-delete-user">Xoá</button></td>';
                    _html += '</tr>';
                });
            }
            else{
                _html = '<tr><td colspan="10">Hiện tại chưa có dữ liệu nào</td></tr>';
            }
            $('#listUser tbody').html(_html);

            render_before_html();
        });
    }
    getUser();

    const login = (username, password, callback) => {
        let found = false,
            userdata = null;
        tblAdmin.orderByChild('username').equalTo(username).once('value', function (snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach(data => {
                    let _tmp = data.val();
                    if (password === _tmp['password']) {
                        found = true;
                        userdata = _tmp;
                        w_data.currentUser = data.key;
                        callback(userdata);
                    }
                });
            } else {
                callback(userdata);
            }
        });
    }

    //login('duy', 'duy', () => {});

    const setUser = (data, success, error) => {
        var newdata = Object.assign(UserSchema, data);
        newdata.dateCreate = new Date().getTime();

        tblUser.orderByChild('bks').equalTo(data.bks).once('value', function (snapshot) {
            if (snapshot.exists()) {
                error();
            } else {
                var newUserKey = tblUser.push().key;
                tblUser.child(newUserKey).update(newdata);
                success(newdata);
            }
        })
    }

    const userHasRegisted = () => {
        if(is_login){
            return false;
        }
        if( Cookies.get('dpv_is_selected') === undefined ){
            return false;
        }
        else{
            return true;
        }
    }


    $(document).on('click', '.btn-register', function (e) {
        e.preventDefault();
        resetRGF();
        if(userHasRegisted()){
            swal("Bạn đã đăng ký rồi!!!!", {
                icon: "error",
            });
        }
        else{
            $('body').removeClass('open-pp2').toggleClass('open-pp');
        }
    });
    $(document).on('click', '.close-pp-reg', function (e) {
        e.preventDefault();
        $('body').removeClass('open-pp2 open-pp open-ppl send-code');
    });

    $(document).on('click', '.btn-login:not(.btn-logout)', function (e) {
        e.preventDefault();
        $('body').removeClass('open-pp2').toggleClass('open-ppl');
    });

    $(document).on('click', '.btn-login.btn-logout', function (e) {
        e.preventDefault();
        $('body').removeClass('loggedin');
        Cookies.set('dpv_is_logged', 'no', { expires: 1, path: '/' });
        $('button.btn-login').html($('button.btn-login').attr('data-old-text')).removeClass('btn-logout');
        $('button.btn-config').addClass('hidden');
        is_login = false;
        render_before_html();
    });

    const rolling = () => {
        $('.send-code button.close-pp-reg').hide();
        timer_rolling = setInterval(() => {
            $('.fc1').html(Math.floor(Math.random() * 9) + 1);
            $('.fc2').html(Math.floor(Math.random() * 10));
        }, 50);
    }

    $(document).on('click', '.fake-code button', function (e){
        e.preventDefault();
        clearInterval(timer_rolling);
        $('.fake-code').hide();
        $('.real-code').show();
        $('.send-code button.close-pp-reg').show();
    })

    $(document).on('click', '.btn-reg-ok', function (e) {
        e.preventDefault();

        var _pass = true;
        var vnf_regex = /((09|03|04|02|06|07|08|05)+([0-9]{8})\b)/g;
        $('.frm-register .frm-input').each(function () {
            if ($(this).val().trim() == '') {
                _pass = false;
                if ($(this).siblings('small').length == 0) {
                    $(this).after('<small>Mời bạn nhập thông tin</small>');
                }
            } else {
                $(this).siblings('small').remove();
            }
        });
        if (vnf_regex.test($('#frm_sdt').val().trim()) == false) {
            _pass = false;
            if ($('#frm_sdt').siblings('small').length == 0) {
                $('#frm_sdt').after('<small>Số điện thoại của bạn không đúng định dạng!</small>');
            } else {
                $('#frm_sdt + small').html('Số điện thoại của bạn không đúng định dạng!');
            }
        }
        var bks_regex = /(([1-9])(\d)([a-zA-Z]{1,2})([-|\.|\s])?([\d]{4,5})\b)/g;
        if (bks_regex.test($('#frm_bks').val().trim()) == false) {
            _pass = false;
            if ($('#frm_bks').siblings('small').length == 0) {
                $('#frm_bks').after('<small>Biển số không đúng định dạng</small>');
            } else {
                $('#frm_bks + small').html('Biển số không đúng định dạng');
            }
        }
        if (_pass) {

            swal({
                title: "Hãy cân nhắc",
                text: "Bạn đã chắc chắn các thông tin bạn nhập là chính xác ?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willSend) => {
                    if (willSend) {

                        var code_remain = [];
                        for (var i = 1; i < w_data.limit; i++) {
                            if (w_data.exist_code.indexOf(i) == -1 && w_data.bad_code.indexOf(i) == -1) {
                                code_remain.push(i);
                            }
                        }

                        if (code_remain.length > 0) {
                            var _id = Math.floor(Math.random() * code_remain.length);
                            var _new_code = code_remain[_id];
                            var _data = {
                                bks: $('#frm_bks').val().trim().replace(/([-|\.|\s])/, '').toUpperCase(),
                                fb: $('#frm_fb').val().trim(),
                                fburl: '',
                                name: $('#frm_name').val().trim(),
                                size: $('#frm_size').val().trim(),
                                phone: $('#frm_sdt').val().trim(),
                                zone: $('#frm_zone').val().trim(),
                                address: $('#frm_address').val().trim(),
                                code: _new_code,
                            }
                            setUser(
                                _data,
                                (newdata) => {
                                    $('body').addClass('send-code');
                                    if(!is_login){
                                        Cookies.set('dpv_is_selected', _new_code, { expires: 365, path: '/' });
                                    }
                                    $('.pp-register .frm-result').html('<div class="fake-code"><h3>Mời bạn quay số</h3><p><span class="fc1">0</span><span class="fc2">0</span></p><button type="button">Stop</button></div><div class="real-code"><h3>Xin chúc mừng, mã số của bạn là</h3><p>' + _new_code + '</p></div>');
                                    getExistCode();
                                    rolling();
                                },
                                () => {
                                    swal("Biến số này đã được đăng ký, vui lòng nhập lại!", {
                                        icon: "error",
                                    });
                                }
                            );
                        }
                        else{
                            swal("Quỹ số đã hết, xin vui lòng liên hệ quản trị viên", {
                                icon: "error",
                            });
                        }
                    }
                });

        }
    });

    $(document).on('click', '.btn-reg-edit', function (e) {
        e.preventDefault();

        var _pass = true;
        var _old_code = $('#frm_code').html().trim();
        var vnf_regex = /((09|03|04|02|06|07|08|05)+([0-9]{8})\b)/g;

        var _user_id = $('#frm_user_id').val().trim();

        if(_old_code == "" || _user_id == ""){
            _pass = false;
            swal("Thông tin không hợp lệ!", {
                icon: "error",
            });
            return;
        }

        $('.frm-register .frm-input').each(function () {
            if ($(this).val().trim() == '') {
                _pass = false;
                if ($(this).siblings('small').length == 0) {
                    $(this).after('<small>Mời bạn nhập thông tin</small>');
                }
            } else {
                $(this).siblings('small').remove();
            }
        });
        if (vnf_regex.test($('#frm_sdt').val().trim()) == false) {
            _pass = false;
            if ($('#frm_sdt').siblings('small').length == 0) {
                $('#frm_sdt').after('<small>Số điện thoại của bạn không đúng định dạng!</small>');
            } else {
                $('#frm_sdt + small').html('Số điện thoại của bạn không đúng định dạng!');
            }
        }
        var bks_regex = /(([1-9])(\d)([a-zA-Z]{1,2})([-|\.|\s])?([\d]{4,5})\b)/g;
        if (bks_regex.test($('#frm_bks').val().trim()) == false) {
            _pass = false;
            if ($('#frm_bks').siblings('small').length == 0) {
                $('#frm_bks').after('<small>Biển số không đúng định dạng</small>');
            }
            else {
                $('#frm_bks + small').html('Biển số không đúng định dạng');
            }
        }

        var _old_data = w_data.Users[_user_id];
        var _new_data = {
            bks: $('#frm_bks').val().trim().replace(/([-|\.|\s])/, '').toUpperCase(),
            fb: $('#frm_fb').val().trim(),
            name: $('#frm_name').val().trim(),
            size: $('#frm_size').val().trim(),
            phone: $('#frm_sdt').val().trim(),
            zone: $('#frm_zone').val().trim(),
            address: $('#frm_address').val().trim(),
            code: parseInt(_old_code),
        }

        var found = Object.values(w_data.Users).filter( (key) => {
            return key.bks.includes(_new_data.bks);
        } );

        let diff = Object.keys(_new_data).reduce((diff, key) => {
            if (_old_data[key] === _new_data[key]) return diff
            return {
                ...diff,
                [key]: _new_data[key]
            }
        }, {});

        if(JSON.stringify(diff).length <= 2){
            swal("Không có gì để cập nhật", {
                icon: "success",
            });
            return;
        }

        if (_pass) {

            swal({
                title: "Hãy cân nhắc",
                text: "Bạn đã chắc chắn các thông tin bạn nhập là chính xác ?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willSend) => {
                    if (willSend) {

                        if(diff.hasOwnProperty('bks')){
                            if(found.length){
                                swal("Biến số này đã được đăng ký, vui lòng nhập lại!", {
                                    icon: "error",
                                });
                            }
                            else{
                                database.ref('tblUser/' + _user_id).update(diff);
                                getExistCode();
                                swal("Thông tin thành viên này đã được cập nhật thành công!", {
                                    icon: "success",
                                });
                            }
                        }
                        else{
                            database.ref('tblUser/' + _user_id).update(diff);
                            getExistCode();
                            swal("Thông tin thành viên này đã được cập nhật thành công!", {
                                icon: "success",
                            });
                        }
                    }
                });
        }
    });

    $(document).on('click', '.btn-login-ok', function (e) {
        e.preventDefault();
        var _pass = true;
        $('.frm-login .frm-input').each(function () {
            if ($(this).val().trim() == '') {
                _pass = false;
                if ($(this).siblings('small').length == 0) {
                    $(this).after('<small>Mời bạn nhập thông tin</small>');
                }
            } else {
                $(this).siblings('small').remove();
            }
        });
        if (_pass) {
            var _username = $('#frm_username').val().trim(),
                _password = $('#frm_password').val().trim();
            login(_username, _password, (data) => {
                if (data == null) {
                    swal("Thông tin đăng nhập không chính xác!", {
                        icon: "error",
                    });
                }
                else {
                    is_login = true;
                    Cookies.set('dpv_is_logged', 'yes', { expires: 1, path: '/' });
                    getUser();
                    $('button.btn-login').attr('data-old-text', $('button.btn-login').html()).html('Đăng xuất').addClass('btn-logout');
                    $('button.btn-config').removeClass('hidden');
                    $('body').addClass('loggedin').removeClass('open-ppl');
                    render_before_html();
                }
            });
        }
    });

    $(document).on('click', '.btn-delete-user', function (e){
        e.preventDefault();
        if(is_login){
            var _id = $(this).closest('tr').attr('data-id');
            swal({
                title: "Hãy cân nhắc",
                text: "Bạn đã chắc chắn muốn làm điều này ?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
                .then((willDelete) => {
                    if (willDelete) {
                        database.ref('tblUser/' + _id).remove();
                        swal("Thông tin thành viên này đã được xoá thành công!", {
                            icon: "success",
                        });
                    }
                });
        }
    });

    $(document).on('click', '#listUser td a', function (e){
        e.preventDefault();
        var _id = $(this).closest('tr').attr('data-id');
        $('body').addClass('open-pp2');

        var user_data = w_data.Users[_id];

        $('#frm_user_id').val(_id);
        $('#frm_name').val(user_data.name);
        $('#frm_bks').val(user_data.bks);
        $('#frm_fb').val(user_data.fb);
        $('#frm_sdt').val(user_data.phone);
        $('#frm_zone').val(user_data.zone);
        $('#frm_size').val(user_data.size);
        $('#frm_address').val(user_data.address ? user_data.address : '');
        $('#frm_code').html(w_data.Users[_id].code).attr('data-code', w_data.Users[_id].code);
    });

    $(document).on('click', '.tbl-search-result button', function (e){
        e.preventDefault();
        $('#listUser tr[data-id="'+$(this).attr('data-id')+'"] td a').trigger('click');
    });

    $(document).on('click', '#frm_code', function (e){
        var _old_val = $(this).text();
        if($(this).find('input').length == 0){
            $(this).append('<input type="number" class="frm_code__tmp" id="frm_code__tmp" name="frm_code__tmp" value="'+_old_val+'" class="frm-input" maxlength="9" size="9" placeholder="'+_old_val+'">')
        }
    });

    $(document).on('focusout', '#frm_code', function (e){
        var _c = $(this),
            _ov = parseInt($(this).data('code')),
            _nv = parseInt(_c.find('input').val());
        _c.text(_nv);
        if( _ov!= _nv){
            _c.addClass('has-change');
        }
        else{
            _c.removeClass('has-change');
        }
    })

    var delaySearch = (function(){
        var timer = 0;
        return function(callback, ms){
            clearTimeout (timer);
            timer = setTimeout(callback, ms);
        };
    })();

    var term_search = '';


    function searchFunc( typing ){

        var _search_by_ms = false,
            keyword = '';

        var _initial_keyword = $('.tbl-search input#tbl_search').val().trim().toUpperCase();

        if(is_login && _initial_keyword.indexOf('MS:') == 0){
            _search_by_ms = true;
            keyword = _initial_keyword.replace('MS:', '');
            keyword = parseInt(keyword);
        }
        else{
            keyword = _initial_keyword.replace(/([-|\.|\s])/, '');
        }

        if ( term_search === keyword && typing ) {
            return;
        }

        if ( (!_search_by_ms && keyword.length < 5) || (_search_by_ms && keyword.length < 1) ) {
            return;
        }

        term_search = keyword;

        if(w_data.Users == null){
            $('.tbl-search-result').html('<p>Không có kết quả nào</p>');
            return;
        }

        var found = w_data.arrUsers.filter( (key) => {
            if(_search_by_ms){
                return key.code == keyword;
            }
            else{
                return key.bks.includes(keyword);
            }
        } );
        if(found.length){

            $('.tbl-search-result').html(() => {
                var _html = '<ol>';
                found.forEach((vl, idx) => {
                    _html += '<li>';
                    _html += '<p><span>Tên thành viên</span><strong>'+vl.name+'</strong></p>';
                    _html += '<p><span>Biển kiếm soát</span><strong>'+vl.bks+'</strong></p>';
                    _html += '<p><span>Mã số</span><strong>'+vl.code+'</strong></p>';
                    if(is_login){
                        _html += '<p><span>Số điện thoại</span><strong>'+vl.phone+'</strong></p>';
                        _html += '<p><span>Facebook</span><strong>'+vl.fb+'</strong></p>';
                        _html += '<p><span>Tỉnh, thành phố</span><strong>'+vl.zone+'</strong></p>';
                        if(vl.address){
                            _html += '<p><span>Địa chỉ nhận Logo</span><strong>'+vl.address+'</strong></p>';
                        }
                        _html += '<p><button type="button" data-id="'+vl.key+'">Cập nhật</button></p>';
                    }
                    _html += '</li>';
                })
                _html += '</ol>';
                return _html;
            })
        }
        else{
            $('.tbl-search-result').html('<p>Không có kết quả nào</p>');
        }
    }

    $(document).on('keyup', '.tbl-search input#tbl_search', function (e){
        var valid = false;

        if ( typeof e.which === 'undefined' ) {
            valid = true;
        }
        else if ( typeof e.which === 'number' && e.which > 0 ) {
            valid = !e.ctrlKey && !e.metaKey && !e.altKey;
        }
        if ( !valid ) {
            return;
        }
        delaySearch(function(){
            searchFunc( true );
        }, 200 );
    })

    $(document).on('click', function (e){
        document.getElementById('dpvaudio').play();
    })

    $(document).on('click', '.btn-config', function (e){
        e.preventDefault();
        $('#frm_c_limit').val(w_data.limit).attr('placeholder', w_data.limit).attr('data-oldv', w_data.limit);
        $('#frm_c_badcode').val(w_data.bad_code).attr('placeholder', w_data.bad_code).attr('data-oldv', w_data.bad_code);
        $('#frm_c_existcode').val(w_data.keep_code).attr('placeholder', w_data.keep_code).attr('data-oldv', w_data.keep_code);
        $('body').addClass('open-pc').removeClass('open-ppl open-pp');
    });
    $(document).on('click', '.close-pp-config', function (e){
        e.preventDefault();
        $('body').removeClass('open-pc');
    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index && value !== 0;
    }

    function render_before_html(){
        if($('.tbl-wrap2 .display-info').length){
            $('.tbl-wrap2 .display-info').remove();
        }
        if(!is_login){
            return false;
        }
        const _exists = DPVDATA.exist_code.concat(DPVDATA.bad_code,DPVDATA.keep_code);
        const _limit = [ ...Array(DPVDATA.limit).keys() ].map( i => i+1 );
        var _remain = _limit.filter(x => !_exists.includes(x));
        var _remain2 = DPVDATA.keep_code.filter(x => !_exists.includes(x));
        console.log(_remain);
        console.log(_remain2);

        var _html = '<div class="display-info">';
        _html += '<p><span>Các số còn lại: </span><span>['+_remain.join(',')+'] ('+_remain.length+'số)</span></p>';
        _html += '<p><span>Số đẹp còn lại: </span><span>['+_remain2.join(',')+'] ('+_remain2.length+'số)</span></p>';
        _html += '</div>';
        $('.tbl-wrap2').prepend(_html);
    }

    $(document).on('click', '.btn-config-ok', function (e){
        e.preventDefault();
        var c_limit, c_badcode, c_keepcode, tmp_badcode, tmp_keepcode;
        c_limit = parseInt($('#frm_c_limit').val());
        c_badcode = $('#frm_c_badcode').val().trim();
        c_keepcode = $('#frm_c_existcode').val().trim();
        tmp_badcode = c_badcode.split(',').map(x=>+x);
        tmp_keepcode = c_keepcode.split(',').map(x=>+x);
        if(tmp_badcode.length){
            tmp_badcode = tmp_badcode.filter(onlyUnique);
        }
        if(tmp_keepcode.length){
            tmp_keepcode = tmp_keepcode.filter(onlyUnique);
        }
        database.ref('tblConfig').update({
            limit: c_limit,
            bad_code: tmp_badcode.join(','),
            exist_code: tmp_keepcode.join(','),
        });
        getExistCode();
        render_before_html();
        swal("Cập nhật thành công!", {
            icon: "success",
        });
    })

})(jQuery);