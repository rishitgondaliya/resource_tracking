function generateTimetable() {
    var semester = document.getElementById('semester').value;
    var division = document.getElementById('division').value;
    var subjects = document.getElementById('subjects').value.split(',');
    var hoursPerWeek = parseInt(document.getElementById('hours').value);

    var timetable = document.getElementById('timetable');
    timetable.innerHTML = '';

    var table = document.createElement('table');
    var thead = document.createElement('thead');
    var tbody = document.createElement('tbody');

    // Create table headers
    var headerRow = document.createElement('tr');
    var headers = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    headers.forEach(function(headerText) {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(headerText));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows
    var times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    times.forEach(function(time) {
        var row = document.createElement('tr');
        var timeCell = document.createElement('td');
        timeCell.appendChild(document.createTextNode(time));
        row.appendChild(timeCell);

        var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(function(day) {
            var dayCell = document.createElement('td');
            dayCell.appendChild(document.createTextNode('-'));
            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    timetable.appendChild(table);

    // Fill in subjects randomly
    var rows = tbody.getElementsByTagName('tr');
    for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        for (var j = 1; j < cells.length; j++) {
            var randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            cells[j].textContent = randomSubject;
        }
    }
}
