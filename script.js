var names = [], roles; // static and are used in most of functions

// wait for the page to load
$(document).ready(function () {
    var data = $('#participants');
    data.keyup(get_names); // update names when typing names
    if (data.val() != '') // used in case of page reload and the names are already typed
        get_names();

    jQuery.get('roles.txt', function (data) { // load roles from the server
        roles = data.split('\n');
        for (var i = 0; i < roles.length; i++) {
            if (roles[i] != '') {
                roles[i] = roles[i].split(';'); // change role into a list containing: Role name; balance; maximum; default count
                var html = "";
                html += '<div class="row"><div class="col-xl">' + roles[i][0] + '</div>';
                html += '<div class="col form-group"><input type="number" class="form-control" id="role_' + i + '" value="' + roles[i][3] + '" min="0" max="' + roles[i][2] + '"></div>';
                html += ' <div class="col-2"><span id="bal' + i + '" class="balance">(<span id="val' + i + '"></span>)</span></div>';
                html += '</div>';
                $('#selected_roles').append(html); // add roles in the correct section
            }
        }
        $('input[type=number]').change((i, r) => { // if the inputs change, compute the balance of the game
            compute_balance();
            show_compo();
            var retained_roles = get_roles();
            if (check_nb(retained_roles)) { // new feature: generate when the number of roles changes if there is enough roles (good for mobiles)
                generate(retained_roles);
            }
        });
        compute_balance(); // compute balance a first time
        show_compo(); // shows the compo at the bottom of the page
    });
});

$('#generate').click(function () {
    var retained_roles = get_roles();
    if (check_nb(retained_roles)) {
        generate(retained_roles);
        document.location = "#goToResults";
    } else { // if the number of roles is incorrect, notify the user
        var diff = retained_roles.length - names.length;
        var s = 'Nombre de rôles incorrect ! Il en faut ' + Math.abs(diff) + ' ';
        if (diff < 0) {
            s += 'de plus !';
        } else {
            s += 'de moins !';
        }
        alert(s); // I may use bootstrap alerts later
    }
});

/**
 * Get the values of the number input to make a list of the retained roles
 * @returns 
 */
function get_roles() {
    var retained_roles = [];
    var roles_count = $('input[type=number]');
    roles_count.each((index, r) => {
        for (var i = 0; i < r.value; i++) {
            //console.log(r.id.substring(5, retained_roles_id[i].id.length));
            retained_roles.push(roles[r.id.substring(5, r.id.length)][0]);
        }
    });
    return retained_roles;
}

/**
 * Checks if the role number matches the number of players
 * @param {List<String>} retained_roles 
 * @returns 
 */
function check_nb(retained_roles) {
    return retained_roles.length == names.length;
}

/**
 * Modify the result tbody to add the roles and the associated names
 * @param {List<String>} retained_roles 
 */
function generate(retained_roles) {
    $('#results').text('');
    for (var i = 0; i < names.length; i++) {
        var app = '';
        app += '<tr><td>' + names[i] + '</td>';
        var role_id = Math.floor(Math.random() * retained_roles.length);
        app += '<td>' + retained_roles[role_id] + '</td></tr>';
        retained_roles.splice(role_id, 1);
        $('#results').append(app);
    }
}

/**
 * Get the content of the textarea and make a list (static)
 */
function get_names() {
    names = $('#participants').val().split('\n');
    var allempty = true;
    for (var name of names) {
        allempty &&= name == '';
    }
    if (allempty) names = [];
    for (var i = 0; i < names.length; i++) {
        if (names[i] == '') {
            names.splice(i, 1);
            i--;
        }
    }
    if (names.length > 0)
        $('#nbJoueurs').text('Nombre de joueur.ses : ' + names.length);
}

/**
 * Computes the balance and displays it using a color code
 */
function compute_balance() {
    var tot = 0;
    $('input[type=number]').each((id, r) => {
        var i = r.id.substring(5, r.id.length);
        var balance = roles[i][1] * r.value;
        if (i == 0 && r.value > 1) {
            balance -= (r.value - 1) * 2;
        }
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
        total_balance.removeClass('text-success text-warning');
        total_balance.addClass('text-danger');
    }
    else if (Math.abs(tot) >= 3) {
        total_balance.removeClass('text-danger text-success');
        total_balance.addClass('text-warning');
    }
    else {
        total_balance.removeClass('text-danger text-warning');
        total_balance.addClass('text-success');
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

/**
 * Creates a small table at the bottom showing the current composition
 */
function show_compo() {
    $('#compo').html('');
    tot = 0;
    $('input[type=number]').each((id, r) => {
        var i = r.id.substring(5, r.id.length);
        var rolename = roles[i][0], count = r.value;
        tot += parseInt(count);
        if (count > 0)
            $('#compo').append('<tr><td>' + count + ' ' + rolename + '</td></tr>');
        $('#nbRoles').text('Nombre de rôles : ' + tot);
    });
}
