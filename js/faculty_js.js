function generateTimetable() {
    var facultyName = document.getElementById("facultyName").value;
    var subject = document.getElementById("subject").value;
    var weeklyHours = parseInt(document.getElementById("weeklyHours").value);
    var daysPerWeek = parseInt(document.getElementById("daysPerWeek").value);

    var timetable = "<h2>Timetable for " + facultyName + "</h2>";
    timetable += "<table border='1'>";
    timetable += "<tr><th>Day</th><th>Time</th><th>Subject</th></tr>";

    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    var hour = 9;
    for (var i = 0; i < daysPerWeek; i++) {
        var day = days[i];
        timetable += "<tr><td rowspan='" + weeklyHours + "'>" + day + "</td>";
        for (var j = 0; j < weeklyHours; j++) {
            if (j > 0) {
                timetable += "<tr>";
            }
            timetable += "<td>" + hour + ":00 - " + (hour + 1) + ":00</td>";
            timetable += "<td>" + subject + "</td>";
            timetable += "</tr>";
            hour++;
        }
        hour = 9; // Reset hour for next day
    }

    timetable += "</table>";
    document.getElementById("timetable").innerHTML = timetable;
}
