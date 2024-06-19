// services.js
angular.module('digitalResourceApp')
    .factory('StudentService', ['$http', function ($http) {
        return {
            getStudents: function (department, semester, year) {
                return $http.get(`/students/${department}/${semester}/${year}`);
            }
        };
    }]);
