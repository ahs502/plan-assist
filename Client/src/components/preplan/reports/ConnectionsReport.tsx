import React, { FC, useState, Fragment } from 'react';
import { Theme, InputLabel, TextField, TableHead, TableCell, Table, TableRow, TableBody, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MasterData, { Airport } from '@core/master-data';
import Flight from 'src/view-models/flight/Flight';
import Weekday from '@core/types/Weekday';
import MultiSelect from 'src/components/MultiSelect';
import classNames from 'classnames';
import { CallMade as ConnectionIcon, Publish as ExportToExcelIcon } from '@material-ui/icons';
import { ExcelExport, ExcelExportColumn } from '@progress/kendo-react-excel-export';
import { CellOptions } from '@progress/kendo-react-excel-export/dist/npm/ooxml/CellOptionsInterface';

const allAirports = MasterData.all.airports.items;

const useStyles = makeStyles((theme: Theme) => ({
  west: {
    backgroundColor: '#FFCC99'
  },
  header: {
    backgroundColor: '#F4B084'
  },
  airportHeader: {
    backgroundColor: '#FBE0CE'
  },
  connectionHeader: {
    backgroundColor: '#C6EFCE'
  },
  tableContainer: {
    width: '100%',
    overflowX: 'scroll'
  },
  export: {
    width: 200
  },
  connectionTo: {
    transform: 'rotate(90deg)',
    top: 13,
    position: 'relative',
    left: 10
  },
  connectionFrom: {
    top: 13,
    position: 'relative',
    right: 10
  },
  boarder: {
    borderColor: theme.palette.grey[400],
    borderStyle: 'solid',
    borderWidth: 1
  },
  removeRightBoarder: {
    borderRight: 'none'
  },
  removeLeftBoarder: {
    borderLeft: 'none'
  },
  main: {
    marginTop: theme.spacing(5),
    marginLeft: theme.spacing(3)
  },
  marginBottom1: {
    marginBottom: theme.spacing(1)
  },
  marginBottom2: {
    marginBottom: theme.spacing(2)
  },
  transform180: {
    transform: 'rotate(180deg)'
  },
  connectionTime: {
    width: 200,
    marginRight: theme.spacing(1)
  }
}));

interface ConnectionsReportProps {
  flights: readonly Flight[];
  preplanName: string;
}

interface ConnectionModel {
  eastAirportArrivalToIranFlight: Flight[];
  eastAirportDepartureFromIranFlight: Flight[];
  westAirportArrivalToIranFlight: Flight[];
  westAirportDepartureFromIranFlight: Flight[];
}

type connectionDirection = 'WesttoEast' | 'EasttoWest';

const ConnectionsReport: FC<ConnectionsReportProps> = ({ flights, preplanName }) => {
  const defaultWestAirport = ['BCN', 'DXB', 'ESB', 'EVN', 'GYD', 'IST', 'MXP', 'VKO'];
  const defaultEastAirpot = ['BKK', 'CAN', 'DEL', 'BOM', 'KUL', 'LHE', 'PEK', 'PVG'];
  const [eastAirport, setEastAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultEastAirpot.indexOf(a.name) != -1));
  const [westAirport, setWestAriport] = useState<readonly Airport[]>(allAirports.filter(a => defaultWestAirport.indexOf(a.name) != -1));
  const [maxConnectionTime, setMaxConnectionTime] = useState<number>(5);
  const [minConnectionTime, setMinConnectionTime] = useState<number>(1);
  const weekDay = Array.range(0, 6);

  let connectionNumberExporter: ExcelExport | null;
  let connectionNumberExportData: any[] = [];
  let connectionTableExporter: ExcelExport | null;
  let connectionTableExportData: any[] = [];

  // useEffect(() => {
  //   generateConnectionCountExportData();
  //   generatePlanExportData();
  // }, [eastAirport, westAirport, minConnectionTime, maxConnectionTime]);

  const classes = useStyles();

  const formatMinuteToString = (minutes: number): string => {
    if (!minutes) return '';
    return (Math.floor(minutes / 60) % 24).toString().padStart(2, '0') + (minutes % 60).toString().padStart(2, '0');
  };

  const compareFunction = (a: number, b: number): number => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  };

  const generateConnectionNumberExportData = () => {
    const result: any[] = [];
    if (eastAirport && westAirport) {
      eastAirport.forEach(ea => {
        const connection: any = {};
        connection['airport'] = ea.name;

        westAirport.forEach(wa => {
          const eastToWest = getNumberOfConnection(ea, wa, 'EasttoWest');
          const westToEast = getNumberOfConnection(wa, ea, 'WesttoEast');

          connection['to' + wa.name] = eastToWest;
          connection['from' + wa.name] = westToEast;
        });
        result.push(connection);
      });
    }
    connectionNumberExportData = result;
  };

  const generateConnectionTableExportData = () => {
    const result: any[] = [];
    if (eastAirport && westAirport) {
      weekDay.forEach(w => {
        const model: any = {};
        model['day'] = Weekday[w].toUpperCase().substring(0, 3);

        eastAirport.forEach(airport => {
          const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
          if (!flights || flights.length == 0) return;

          const stas = flights
            .map(flight => {
              return flight.std.minutes + flight.weekdayRequirement.scope.blockTime;
            })
            .sort(compareFunction);
          model['from' + airport.name] = stas.map(a => formatMinuteToString(a)).join('\r\n');
        });

        eastAirport.forEach(airport => {
          const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
          if (!flights || flights.length == 0) return;

          const stds = flights
            .map(flight => {
              return flight.std.minutes;
            })
            .sort(compareFunction);
          model['to' + airport.name] = stds.map(a => formatMinuteToString(a)).join('\r\n');
        });

        westAirport.forEach(airport => {
          const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
          const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id == airport.id);

          const stas = arrivalToIran.map(flight => flight.std.minutes + flight.weekdayRequirement.scope.blockTime).sort(compareFunction);
          const stds = departureFromIran.map(flight => flight.std.minutes).sort(compareFunction);

          if (stas.length <= 0 && stds.length <= 0) return;
          model[airport.name] = Array.range(0, Math.max(stas.length, stds.length) - 1)
            .map(i => {
              return formatMinuteToString(stds[i]) + '-' + formatMinuteToString(stas[i]);
            })
            .join('\r\n');
        });

        result.push(model);
      });
    }
    connectionTableExportData = result;
  };

  const getNumberOfConnection = (departureAirport: Airport, arrivalAriport: Airport, direction: connectionDirection): number => {
    let firstFligths: Flight[] = [];
    let secoundFlights: Flight[] = [];

    let result: number = 0;

    weekDay.forEach(w => {
      if (direction === 'EasttoWest') {
        firstFligths = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === departureAirport.id);
        secoundFlights = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === arrivalAriport.id);
      } else {
        firstFligths = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === departureAirport.id);
        secoundFlights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === arrivalAriport.id);
      }

      if (
        firstFligths.some(ff => {
          const sta = (ff.std.minutes + ff.weekdayRequirement.scope.blockTime) % 1440;
          return secoundFlights.some(
            sf => sf.std.minutes < sta + maxConnectionTime * 60 && sf.std.minutes > sta + minConnectionTime * 60 && ff.arrivalAirport.id === sf.departureAirport.id
          );
        })
      ) {
        result++;
      }
    });

    return result;
  };

  const flightPerDay: { [index: number]: ConnectionModel } = {};

  const detailCellOption = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 9
  } as CellOptions;

  const headerCellOptions = {
    textAlign: 'center',
    verticalAlign: 'center',
    borderBottom: { color: '#BDBDBD', size: 1 },
    borderLeft: { color: '#BDBDBD', size: 1 },
    borderRight: { color: '#BDBDBD', size: 1 },
    borderTop: { color: '#BDBDBD', size: 1 },
    fontSize: 12,
    bold: true
  } as CellOptions;

  weekDay.forEach(w => {
    flightPerDay[w] = {
      eastAirportArrivalToIranFlight: [],
      eastAirportDepartureFromIranFlight: [],
      westAirportArrivalToIranFlight: [],
      westAirportDepartureFromIranFlight: []
    } as ConnectionModel;

    if (!eastAirport || !westAirport) return;

    flightPerDay[w].eastAirportArrivalToIranFlight = flights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.departureAirport.id === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].eastAirportDepartureFromIranFlight = flights.filter(f => {
      var airportValidation = eastAirport.some(airport => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
      if (!airportValidation) return false;
      if (f.weekdayRequirement.day !== w) return false;
      return true;
    });

    flightPerDay[w].westAirportArrivalToIranFlight = flights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.departureAirport.id === airport.id);
      if (!airportValidation) return false;

      const departureWeekDay = f.weekdayRequirement.day;
      const sta = f.std.minutes + f.weekdayRequirement.scope.blockTime;
      const arrivalWeekDay = sta <= 1440 ? departureWeekDay : (departureWeekDay + 1) % 7;
      if (arrivalWeekDay !== w) return false;

      return true;
    });

    flightPerDay[w].westAirportDepartureFromIranFlight = flights.filter(f => {
      var airportValidation = westAirport.some(airport => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
      if (!airportValidation) return false;
      if (f.weekdayRequirement.day !== w) return false;
      return true;
    });
  });

  generateConnectionNumberExportData();
  generateConnectionTableExportData();

  return (
    <Fragment>
      <InputLabel htmlFor="east-airport" className={classes.marginBottom1}>
        East Airport
      </InputLabel>

      <MultiSelect
        id="east-airport"
        value={eastAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setEastAriport(value || []);
        }}
        className={classes.marginBottom1}
      />
      <br />
      <InputLabel htmlFor="west-airport" className={classes.marginBottom1}>
        West Airport
      </InputLabel>
      <MultiSelect
        id="west-airport"
        value={westAirport}
        options={allAirports}
        getOptionLabel={r => r.name}
        getOptionValue={r => r.id}
        onSelect={value => {
          setWestAriport(value || []);
        }}
      />
      <br />
      <TextField
        className={classNames(classes.marginBottom2, classes.connectionTime)}
        label="Minimum Connection Time"
        type="number"
        value={minConnectionTime}
        onChange={e => +e.target.value >= 0 && setMinConnectionTime(+e.target.value)}
      />
      <TextField
        className={classNames(classes.marginBottom2, classes.connectionTime)}
        label="Maximum Connection Time"
        type="number"
        value={maxConnectionTime}
        onChange={e => +e.target.value >= 0 && setMaxConnectionTime(+e.target.value)}
      />
      <div className={classNames(classes.export, classes.marginBottom1)}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            if (connectionTableExporter) {
              const options = connectionTableExporter.workbookOptions();
              const rows = options && options.sheets && options.sheets[0] && options.sheets[0].rows;
              if (rows) {
                rows.forEach(r => {
                  if (r.cells) {
                    const numberOfNewLive = r.cells.map(c => (typeof c.value === 'string' ? c.value.split('\r\n').length : 0)).sort(compareFunction);
                    r.height = 15 * numberOfNewLive[numberOfNewLive.length - 1] + 5;
                  }
                });
              }

              connectionTableExporter.save(options);
            }
          }}
        >
          Export to Excel
          <ExportToExcelIcon className={classes.transform180} />
        </Button>

        <ExcelExport
          data={connectionTableExportData}
          fileName="ConnectionTable.xlsx"
          ref={exporter => {
            connectionTableExporter = exporter;
          }}
        >
          <ExcelExportColumn
            title={preplanName}
            field="day"
            width={30}
            cellOptions={{ ...headerCellOptions, background: '#F4B084' }}
            headerCellOptions={{ ...headerCellOptions, background: '#F4B084' }}
          />
          {eastAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={'from' + airport.name}
              title={airport.name}
              width={30}
              cellOptions={{ ...detailCellOption, wrap: true }}
              headerCellOptions={{ ...headerCellOptions, background: '#F4B084', color: '#000000' }}
            />
          ))}
          {westAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={airport.name}
              title={airport.name}
              width={54}
              cellOptions={{ ...detailCellOption, wrap: true, background: '#FBE0CE' }}
              headerCellOptions={{ ...headerCellOptions, background: '#F4B084', color: '#000000' }}
            />
          ))}
          {eastAirport.map(airport => (
            <ExcelExportColumn
              key={airport.id}
              field={'to' + airport.name}
              title={airport.name}
              width={30}
              cellOptions={{ ...detailCellOption, wrap: true }}
              headerCellOptions={{ ...headerCellOptions, background: '#F4B084', color: '#000000' }}
            />
          ))}
        </ExcelExport>
      </div>
      <div className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow className={classes.header}>
              <TableCell className={classes.boarder} />
              <TableCell colSpan={eastAirport.length} align="center" className={classes.boarder}>
                Arrival to IKA
              </TableCell>
              <TableCell colSpan={westAirport.length} className={classes.boarder} />

              <TableCell colSpan={eastAirport.length} align="center" className={classes.boarder}>
                Departure from IKA
              </TableCell>
            </TableRow>
            <TableRow className={classes.airportHeader}>
              <TableCell className={classNames(classes.header, classes.boarder)} />
              {eastAirport.map(airport => (
                <TableCell key={airport.id} className={classes.boarder}>
                  {airport.name}
                </TableCell>
              ))}
              {westAirport.map(airport => (
                <TableCell key={airport.id} className={classes.boarder}>
                  {airport.name}
                </TableCell>
              ))}
              {eastAirport.map(airport => (
                <TableCell key={airport.id} className={classes.boarder}>
                  {airport.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekDay.map(w => (
              <TableRow key={w}>
                <TableCell className={classNames(classes.header, classes.boarder)}>{Weekday[w]}</TableCell>
                {eastAirport.map(airport => {
                  const flights = flightPerDay[w].eastAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
                  if (!flights || flights.length == 0) return <TableCell className={classes.boarder} key={airport.id} />;

                  const stas = flights
                    .map(flight => {
                      return flight.std.minutes + flight.weekdayRequirement.scope.blockTime;
                    })
                    .sort(compareFunction);

                  return (
                    <TableCell key={airport.id} className={classes.boarder}>
                      <Fragment>
                        {stas.map((sta, i) => {
                          return <div key={i}>{formatMinuteToString(sta)}</div>;
                        })}
                      </Fragment>
                    </TableCell>
                  );
                })}

                {westAirport.map(airport => {
                  const arrivalToIran = flightPerDay[w].westAirportArrivalToIranFlight.filter(f => f.weekdayRequirement.definition.departureAirport.id === airport.id);
                  const departureFromIran = flightPerDay[w].westAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id == airport.id);

                  const stas = arrivalToIran.map(flight => flight.std.minutes + flight.weekdayRequirement.scope.blockTime).sort(compareFunction);
                  const stds = departureFromIran.map(flight => flight.std.minutes).sort(compareFunction);

                  if (stas.length <= 0 && stds.length <= 0) return <TableCell key={airport.id} className={classNames(classes.west, classes.boarder)} />;
                  return (
                    <TableCell key={airport.id} className={classNames(classes.west, classes.boarder)}>
                      <Fragment>
                        {Array.range(0, Math.max(stas.length, stds.length) - 1).map(i => {
                          return (
                            <div key={i}>
                              {formatMinuteToString(stds[i])}&ndash;{formatMinuteToString(stas[i])}
                            </div>
                          );
                        })}
                      </Fragment>
                    </TableCell>
                  );
                })}

                {eastAirport.map(airport => {
                  const flights = flightPerDay[w].eastAirportDepartureFromIranFlight.filter(f => f.weekdayRequirement.definition.arrivalAirport.id === airport.id);
                  if (!flights || flights.length == 0) return <TableCell className={classes.boarder} key={airport.id} />;
                  const stds = flights.map(flight => flight.std.minutes).sort(compareFunction);
                  return (
                    <TableCell key={airport.id} className={classes.boarder}>
                      <Fragment>
                        {stds.map((std, i) => {
                          return <div key={i}>{formatMinuteToString(std)}</div>;
                        })}
                      </Fragment>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <br />
      <br />

      <div className={classes.export}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            //generateConnectionCountExportData();
            if (connectionNumberExporter) connectionNumberExporter.save();
          }}
          className={classes.marginBottom1}
        >
          Export to Excel
          <ExportToExcelIcon className={classes.transform180} />
        </Button>

        <ExcelExport
          data={connectionNumberExportData}
          fileName="NumberOfConnection.xlsx"
          ref={exporter => {
            connectionNumberExporter = exporter;
          }}
        >
          <ExcelExportColumn
            field="airport"
            locked={false}
            title={preplanName}
            width={100}
            cellOptions={{ ...headerCellOptions, background: '#C6EFCE', color: '#000000' }}
            headerCellOptions={{ ...headerCellOptions, background: '#C6EFCE', color: '#000000' }}
          />

          {westAirport.map(wa => (
            <Fragment key={wa.id}>
              <ExcelExportColumn
                field={'to' + wa.name}
                title={'To ' + wa.name}
                locked={false}
                width={100}
                cellOptions={{ ...detailCellOption, wrap: true, fontSize: 12 }}
                headerCellOptions={{ ...headerCellOptions, background: '#C6EFCE', color: '#000000' }}
              />
              <ExcelExportColumn
                field={'from' + wa.name}
                title={'From ' + wa.name}
                locked={false}
                width={100}
                cellOptions={{ ...detailCellOption, wrap: true, fontSize: 12, borderRight: { size: 2, color: '#000000' } }}
                headerCellOptions={{ ...headerCellOptions, background: '#C6EFCE', color: '#000000', borderRight: { size: 2, color: '#000000' } }}
              />
            </Fragment>
          ))}
        </ExcelExport>
      </div>
      <div className={classes.tableContainer}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className={classNames(classes.connectionHeader, classes.boarder)} />
              {westAirport.map(wa => (
                <TableCell className={classNames(classes.connectionHeader, classes.boarder)} key={wa.id} colSpan={2} align="center">
                  <ConnectionIcon className={classes.connectionFrom} />
                  {wa.name}
                  <ConnectionIcon className={classes.connectionTo} />
                </TableCell>
              ))}
            </TableRow>
            {eastAirport.map(ea => (
              <TableRow key={ea.id}>
                <TableCell className={classNames(classes.connectionHeader, classes.boarder)} align="center">
                  {ea.name}
                </TableCell>
                {westAirport.map(wa => (
                  <Fragment key={wa.id}>
                    <TableCell className={classNames(classes.boarder, classes.removeRightBoarder)} align="center">
                      {getNumberOfConnection(ea, wa, 'EasttoWest')}
                    </TableCell>
                    <TableCell className={classNames(classes.boarder, classes.removeLeftBoarder)} align="center">
                      {getNumberOfConnection(wa, ea, 'WesttoEast')}
                    </TableCell>
                  </Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Fragment>
  );
};

export default ConnectionsReport;
