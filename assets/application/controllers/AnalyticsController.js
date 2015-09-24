/* global moment */
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
'use strict';

/* Controllers */

angular.module('adminConsole.controllers.AnalyticsControllers', ['adminConsole.services', 'n3-line-chart'])

        .controller('AnalyticsMainController', ['$scope', '$location', '$log', 'Utilities', 'httpErrorHandler', 'data', '$http', '$route', function (scope, location, log, utilities, httpErrorHandler, data, http, route) {
            scope.data = data;
            scope.error = false;
            scope.errorMessage = null;
            scope.linkClass = utilities.linkClass;

            var dateFormat = 'YYYY-MM-DD';

            var now = moment();
            var start = moment(now);
            var end = moment(now);

            var defaults = {
                start: start.subtract(10, 'days'),
                end: end,
                versions: [],
                version: undefined,
                models: [],
                model: undefined
            };

            scope.filters = {
                start: defaults.start.format(dateFormat),
                end: defaults.end.format(dateFormat),
                versions: defaults.versions,
                models: defaults.models,
                version: defaults.version,
                model: defaults.model
            };

            scope.alerts = {
                success: null,
                info: null,
                warning: null,
                danger: null,
                has: {
                    success: false,
                    info: false,
                    warning: false,
                    danger: false
                }
            };

            var attachWarning = function (message) {
                scope.alerts.warning = {
                    message: message
                };
                scope.alerts.has.warning = true;
                setTimeout(function () {
                    scope.alerts.has.warning = false;
                    scope.$apply();
                }, 3500);
            };

            var getVersionsAndModels = function (version) {
                var _version = version || 'v1';
                http.get(
                        'api/info',
                        { params: {version: _version} }
                ).success(function (data) {
                            scope.filters.version = _version;
                            scope.filters.model = data.api_models[0];
                            scope.filters.versions = data.supported_api_versions;
                            scope.filters.models = data.api_models;
                        }).error(function () {
                            attachWarning('Could not get models for version');
                            httpErrorHandler(scope);
                        });
            };

            getVersionsAndModels(defaults.version);

            scope.requestData = function () {
                var start = moment(scope.filters.start);
                var end = moment(scope.filters.end);
                var version = scope.filters.version;
                var model = scope.filters.model;
                populate(start, end, version, model);
            };

            scope.versionChanged = function () {
                var current = scope.filters.version;
                getVersionsAndModels(current);
            };

            scope.plotInitialized = false;
            scope.chartHasValues = true;

            var options = function (metric) {
                scope[metric + "_options"] = {
                    axes: {
                        x: {type: "date", key: "x"},
                        y: {type: "linear"}
                    },
                    series: [
                        {
                            y: metric + "_read",
                            label: "read operations",
                            color: "#289DB2",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_0"
                        },
                        {
                            y: metric + "_create",
                            label: "create operations",
                            color: "#B7C84A",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_1"
                        },
                        {
                            y: metric + "_update",
                            label: "update operations",
                            color: "#402B8C",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_2"
                        },
                        {
                            y: metric + "_delete",
                            label: "delete operations",
                            color: "#4DB54B",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_3"
                        },
                        {
                            y: metric + "_sign_in",
                            label: "sign in operations",
                            color: "#A81E1E",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_4"
                        },
                        {
                            y: metric + "_sign_out",
                            label: "sign out operations",
                            color: "#FA853C",
                            axis: "y",
                            type: "line",
                            thickness: "2px",
                            dotSize: 2,
                            id: "series_5"
                        }
                    ],
                    stacks: [],
                    lineMode: "linear",
                    tension: 0.7,
                    tooltip: {mode: "scrubber"},
                    drawLegend: true,
                    drawDots: true,
                    columnsHGap: 5
                };
            };

            var getMomentFromResponseEntry = function (entry) {
                return moment(entry._id.year + '-' + entry._id.month + '-' + entry._id.day);
            };

            var sortMomentDatesAsc = function (lhs, rhs) {
                return lhs.moment < rhs.moment ? -1 : 1;
            };

            // Creates a chart series for any metric that comes from the analytics controller
            var getSeries = function (metric, data) {
                var chartdata = {};
                var tmp_key_maps = [];
                for (var i = 0; i < data.length; i++) {
                    var entryMoment = getMomentFromResponseEntry(data[i]);
                    var entryTempKey = entryMoment.format(dateFormat);
                    var entryMetricKey = metric + '_' + data[i]._id.action.toLowerCase();

                    // If there is an entry for that day within the chartdata then add the current entry value
                    // to that previous entry
                    if (chartdata[entryTempKey] != undefined) {
                        chartdata[entryTempKey][entryMetricKey] += data[i][metric];
                    } else {
                        //register the moment.js date and its corresponding key for sorting
                        tmp_key_maps.push({
                            moment: entryMoment,
                            key: entryTempKey
                        });

                        var chartEntry = {
                            x: entryMoment.toDate()
                        };

                        chartEntry[metric + '_create'] = 0;
                        chartEntry[metric + '_update'] = 0;
                        chartEntry[metric + '_delete'] = 0;
                        chartEntry[metric + '_read'] = 0;
                        chartEntry[metric + '_sign_in'] = 0;
                        chartEntry[metric + '_sign_out'] = 0;

                        chartEntry[entryMetricKey] = data[i][metric];
                        chartdata[entryTempKey] = chartEntry;
                    }
                }
                // transform chardata object into array
                // sort tmp_key_maps by moment.js dates
                // D3 needs the array of values to be in order, sorted by the date of each metric value
                tmp_key_maps.sort(sortMomentDatesAsc);

                var result = [];

                for (var j = 0; j < tmp_key_maps.length; j++) {
                    var aux_entry = chartdata[tmp_key_maps[j].key];
                    result.push(aux_entry);
                }

                return result;
            };

            var populate = function (start, end, version, model) {
                http.post(
                        '/api/activity/aggregate',
                        {
                            action_names: ["CREATE", "UPDATE", "DELETE", "READ", "SIGN_IN", "SIGN_OUT"],
                            start_day: start.date(),
                            // start.month and end.month are 0 based
                            start_month: start.month() + 1,
                            start_year: start.year(),
                            end_day: end.date(),
                            end_month: end.month() + 1,
                            end_year: end.year(),
                            model_names: [model],
                            api_versions: [version]
                        }).success(function (data) {
                            scope.avg_rsp_time_series = getSeries('avg_rsp_time', data);
                            scope.avg_rsp_size_series = getSeries('avg_rsp_size', data);
                            scope.count_series = getSeries('count', data);

                            scope.plotInitialized = true;
                            if (
                                    scope.avg_rsp_time_series.length > 0 ||
                                    scope.avg_rsp_size_series.length > 0 ||
                                    scope.count_series.length > 0
                                    ) {
                                scope.chartHasValues = true;
                            } else {
                                scope.chartHasValues = false;
                            }
                            options("avg_rsp_time");
                            options("count");
                            options("avg_rsp_size");

                        }).error(function () {
                            attachWarning('Failed to get analytics info');
                            httpErrorHandler(scope);
                        });
            };
        }]);
