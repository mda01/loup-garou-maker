var names, roles;

$(document).ready(function () {
    jQuery.get('participants.txt', function (data) {
        names = data.split('\n');
        for (var i = 0; i < names.length; i++) {
            if (names[i] != '')
                $('#participants').append('<li id="name_' + i + '">' + names[i] + '</li>');
            else {
                names.splice(i, i);
                i--;
            }
        }
    });
    jQuery.get('roles.txt', function (data) {
        roles = data.split('\n');
        for (var i = 0; i < roles.length; i++) {
            if (roles[i] != '') {
                roles[i] = roles[i].split(';');
                $('#selected_roles').append('<label>' + roles[i][0] + '</label>')
                $('#selected_roles').append('<input type="number" id="role_' + i + '" value="' + roles[i][3] + '" min="0" max="' + roles[i][2] + '">');
                $('#selected_roles').append(' <span id="bal' + i + '" class="balance">(<span id="val' + i + '"></span>)</span>');
                $('#selected_roles').append('<br>');
            }
        }
        $('input[type=number]').change((i, r) => {
            compute_balance();
        });
        compute_balance();
    });
});
$('#generate').click(function () {
    var retained_roles = [];
    var roles_count = $('input[type=number]');
    roles_count.each((index, r) => {
        console.log(r);
        for (var i = 0; i < r.value; i++) {
            //console.log(r.id.substring(5, retained_roles_id[i].id.length));
            retained_roles.push(roles[r.id.substring(5, r.id.length)][0]);
        }
    })

    if (retained_roles.length != names.length) {
        var diff = retained_roles.length - names.length;
        var s = 'Nombre de rôles incorrect ! Il faut ' + Math.abs(diff) + ' ';
        if (diff < 0) {
            s += 'de plus !';
        } else {
            s += 'de moins !';
        }
        alert(s);
        return;
    }
    //var id = parseInt(retained_roles_id[i].id.substring(5, retained_roles_id[i].id.length));
    $('#results').html('');
    for (var i = 0; i < names.length; i++) {
        var app = '';
        app += '<tr><td>' + names[i] + '</td>';
        var role_id = Math.floor(Math.random() * retained_roles.length);
        app += '<td>' + retained_roles[role_id] + '</td></tr>';
        retained_roles.splice(role_id, 1);
        $('#results').append(app);
    }
});

function compute_balance() {
    var tot = 0;
    $('input[type=number]').each((id, r) => {
        var i = r.id.substring(5, r.id.length);
        var balance = roles[i][1] * r.value;
        
        $('#val' + i).text(balance);
        if (r.value != 0) {
            $('#bal' + i).show(500);
        } else {
            $('#bal' + i).hide(500);
        }
        tot += balance;
    });
    var total_balance = $('#baltot')
    total_balance.text(tot);
    total_balance.append(' / ')
    if (Math.abs(tot) > 5) {
        total_balance.removeClass('green orange');
        total_balance.addClass('red');
    }
    else if (Math.abs(tot) >= 3) {
        total_balance.removeClass('red green');
        total_balance.addClass('orange');
    }
    else {
        total_balance.removeClass('red orange');
        total_balance.addClass('green');
        if (tot != 0)
            total_balance.append(' Léger');
    }
    if (tot != 0) {
        total_balance.append(' Avantage aux');
        if (tot < 0) {
            total_balance.append(' loups');
        } else {
            total_balance.append(' villageois');
        }
    } else {
        total_balance.append('Équilibré');
    }
}

