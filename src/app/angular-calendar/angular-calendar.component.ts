import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, TemplateRef, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { CalendarDateFormatter, CalendarDayViewBeforeRenderEvent, CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarEventTitleFormatter, CalendarMonthViewBeforeRenderEvent, CalendarView, CalendarViewPeriod, CalendarWeekViewBeforeRenderEvent, DAYS_OF_WEEK } from 'angular-calendar';
import { isSameMonth, isSameDay, startOfDay, endOfDay, addDays, addMinutes, endOfWeek } from 'date-fns';
import { colors } from '../utils/colors';
import { EventService } from '../core/services/app/event.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateFormatter } from '../utils/customDateFormatter'
import { WeekViewHourSegment } from 'calendar-utils';
import { CustomEventTitleFormatter } from '../utils/customEventTitleFormatter'
import { Evenement } from '../core/models/evenement.schema';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DriverService } from '../core/services/app/driver.service';
import { PatientService } from '../core/services/app/patient.service';
import { Driver } from '../core/models/driver.schema';
import { Patient } from '../core/models/patient.schema';
import { Place } from '../core/models/place.schema';
import { PlaceService } from '../core/services/app/place.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import Swal from 'sweetalert2';
import { FORMAT_yyyy_dd_MM } from '../core/constants';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-angular-calendar',
  templateUrl: './angular-calendar.component.html',
  styleUrls: ['./angular-calendar.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    }, {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],
  styles: [
    `
      .disable-hover {
        pointer-events: none;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AngularCalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  @ViewChild('modalInfoContent', { static: true }) modalInfoContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = []
  period: CalendarViewPeriod;
  CalendarView: CalendarView;
  locale = 'fr';
  dragToCreateActive = false;
  eventsToSave: Evenement[]  // events list to save if it is complete
  weekDayStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekStartsOn : 0 = 0;
  weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];
  activeDayIsOpen: boolean = true;
  displayChangesMsg: boolean = false;
  eventForm: FormGroup

  /** Driver, patient, places list */
  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  placeList: Place[];
  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string

  //Map driver-color
  driverColorMap: Map<string, string> = new Map();

  // Add event on click
  dateOnClick : string
  startTimeOnClick : string
  endTimeOnClick : string

  /** Form variables */
  newEvent = true
  updatingEvent = false
  startHourSelected: string
  pipe = new DatePipe('fr');

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  modalInfoData: {
    event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();

  constructor(private cdr: ChangeDetectorRef, private datePipe: DatePipe,
    private eventService: EventService, private driverService: DriverService, private patientService: PatientService, private placeService: PlaceService,
    private modal: NgbModal, private dialog: MatDialog) { }

  initEventForm() {
    this.eventForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      patient: new FormControl(null, Validators.required),
      date: new FormControl(null),
      startPoint: new FormControl(null, Validators.required),
      startHour: new FormControl(null),
      endPoint: new FormControl(null, Validators.required),
      endHour: new FormControl(null),
    })
  }
  ngOnInit(): void {
    registerLocaleData(localeFr, 'fr');

    this.initEventForm()

    /** Populate drivers, patient, place lists  */
    this.populateLists()

    /** Get all events from db to display them */
    this.addEventsToCalendar()
  }

  openDialog(event) {
    this.displayEditDialog("Adding Event", event)
  }

  // Add events before view is visible
  beforeViewRender(
    event:
      | CalendarWeekViewBeforeRenderEvent
      | CalendarDayViewBeforeRenderEvent
      | CalendarMonthViewBeforeRenderEvent
  ) {
    this.period = event.period;
    this.cdr.detectChanges();
  }

  /** Monitor calendar */
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Modifier',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.displayEditDialog('Modifié', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Supprimer',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.displayEditDialog('Supprimé', event);
      },
    },
  ];

  setView(view: CalendarView) {
    this.view = view;
    this.refresh.next()
    this.beforeViewRender(null)
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.refresh;
  }

  /** Monitoring action on Calendar */

  // Monitor day click : close if sameDay and open "active day" if it is an other day
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  displayEditDialog(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  displayEventInfoDialog(event: CalendarEvent): void {
    this.modalInfoData = { event };
    this.modal.open(this.modalInfoContent, { size: 'lg' });
  }

  addEvent(event : Evenement): void {
    console.log("Event to analyse : " + JSON.stringify(event))
    let year = parseInt(event.date.split("-")[2])
    let month = parseInt(event.date.split("-")[1])
    let day = parseInt(event.date.split("-")[0])
    let startHour = parseInt(event.startHour.split(":")[0])
    let startMinute = parseInt(event.startHour.split(":")[1])
    let endHour = parseInt(event.endHour.split(":")[0])
    let endMinute = parseInt(event.endHour.split(":")[1])
    console.log("All fields \n year : ", year, "\n month ", month, "\n day : ", day, " \n startHour : ", startHour, "\n startMinute : ", startMinute, "\n endHour :", endHour, "\n endMinute : ", endMinute)
    console.log("Date to save start : ", new Date(year, month, day, startHour, startMinute))
    console.log("Date to save end : ", new Date(year, month, day, endHour, endMinute))

    this.events.push(
      {
        title: event.driver.firstname,
        //new Date(year, month, day, hours, minutes, seconds, milliseconds)	
        start: new Date(year, month, day, startHour, startMinute),
        end: new Date(year, month, day, endHour, endMinute),
        actions: this.actions,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        draggable: true,
        meta: {
          event // Add event item to CalendarEvent
        }
      }
    )
    this.addEventsToCalendar()

    this.refresh.next();
    console.log(this.events +'arrtyyu');
    this.cdr.detectChanges()
  }

  /** CRUD on events */
  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
    this.displayEventInfoDialog
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;

    console.log("Event changed : ", JSON.stringify(event))

    var eventToAddToDB = new Evenement();
    eventToAddToDB.title = event.title;
    eventToAddToDB.patient = event.meta.item.patient;
    eventToAddToDB.driver = event.meta.item.driver
    eventToAddToDB.date = this.datePipe.transform(this.pipe.transform(newStart, 'shortDate'), FORMAT_yyyy_dd_MM)
    eventToAddToDB.startPoint = event.meta.item.startPoint
    eventToAddToDB.endPoint = event.meta.item.endPoint
    eventToAddToDB.startHour = this.pipe.transform(newStart, 'shortTime');
    eventToAddToDB.endHour = this.pipe.transform(newEnd, 'shortTime');
    console.log("Event to update : ", eventToAddToDB)

    // Update in db
    eventToAddToDB.id = event.meta.item.id
      this.eventService.updateEvent(eventToAddToDB).subscribe(
        (events) => {
          this.eventList = events;
          this.eventList.forEach(element => {
          });
          alertWithSuccess('L\'évènement a été modifié avec succès')
          this.clearEventForm()
        }
      )
    this.refresh.next();
  }

  addEventOnClickInWeekView(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    const myDate = new Date(segment.date);

    const myFormattedDate = this.pipe.transform(myDate, 'short');
    const myShortDate = this.pipe.transform(myDate, 'shortDate');
    const shortTime = this.pipe.transform(myDate, 'shortTime');
    
    //console.log("TIME : ", segment.date)
    //console.log("FORMATTED DATE : ", myFormattedDate)
    console.log("FORMATTED SHORT DATE : ", myShortDate)
    this.dateOnClick = myShortDate
    
    console.log("FORMATTED SHORT TIME : ", shortTime)
    this.startTimeOnClick = shortTime

    //console.log("END DATE : ", endShortDate)
    //console.log("END TIME : ", endShortTime)

    console.log("END TIME + 15min: ", new Date(segment.date.getTime() + 15 * 60000))
    console.log("END SHORT TIME + 15: ", this.pipe.transform(new Date(segment.date.getTime() + 15 * 60000), 'shortTime'))
    this.endTimeOnClick = this.pipe.transform(new Date(segment.date.getTime() + 15 * 60000), 'shortTime')

    // It is a new event
    this.newEvent = true
    this.openDialog(new Evenement())
  }

  /*private refresh() {
    //this.events = [...this.events];
    //this.cdr.detectChanges();
  }*/


/** Evenemnt monitoring */

// Add event after fill form
onSubmit() {
  console.log(this.eventForm);

  this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
    (item) => { this.selectedDriver = item });

  this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
    (item) => { this.selectedPatient = item });

  this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
    (item) => { this.selectedStarPoint = item });

  this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
    (item) => { this.selectedEndPoint = item });

  var eventToAddToDB = new Evenement();
  eventToAddToDB.title = this.selectedPatient.firstname + " " + this.selectedPatient.lastname.toUpperCase();
  eventToAddToDB.patient = this.selectedPatient;
  eventToAddToDB.driver = this.selectedDriver
  eventToAddToDB.date = this.datePipe.transform(this.dateOnClick, FORMAT_yyyy_dd_MM)
  eventToAddToDB.startPoint = this.selectedStarPoint
  eventToAddToDB.endPoint = this.selectedEndPoint
  eventToAddToDB.startHour = this.startTimeOnClick
  eventToAddToDB.endHour = this.endTimeOnClick

  console.log("Event to add on click : ", JSON.stringify(eventToAddToDB))
  console.log("This new event : ", this.newEvent)
  if (this.newEvent) {
    this.eventService.addEventAndGetId(eventToAddToDB).subscribe(
      (events) => {
        console.log("Events retrieved : ", JSON.stringify(events))
        this.eventList = events[1]
        var eventIdAdded = events[0]
        eventToAddToDB.id = eventIdAdded //add id to the freshly added event to retrieve it after click
        alertWithSuccess('L\'évènement a été ajouté avec succès')
        this.clearEventForm()
        //var eventInput = this.convertEventToEventCalendar(eventToAddToDB)
        //this.addEvent(eventToAddToDB);
        this.addEventsToCalendar()
        this.refresh.next();
      },
      (error) => errorAlert()
    );
  } else if (this.updatingEvent) {
    eventToAddToDB.id = this.eventForm.get('id').value
    this.eventService.updateEvent(eventToAddToDB).subscribe(
      (events) => {
        this.eventList = events;
        this.eventList.forEach(element => {
        });
        alertWithSuccess('L\'évènement a été modifié avec succès')
        this.clearEventForm()
      }
    )
  }
}

/** Convert event in angular-calendar to event for db */

convertEventToEventCalendar(event: Evenement) {
  var dateEv = event.date;
  var startTimeEv = event.startHour;
  var endTimeEv = event.endHour;
  var i = 1;

  // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
  // January - 0, February - 1, etc.
  var eventInput = {
    title: event.patient.firstname + " " + event.patient.lastname.toUpperCase() + "\n | " + event.driver.firstname + "\n | " ,
    start: dateEv + "T" + startTimeEv + ":00",
    end: dateEv + "T" + endTimeEv + ":00",
    backgroundColor: this.getColorFromId(event.driver.id),
    extendedProps: {
      eventId: event.id,
      driverId: event.driver.id,
      patientId: event.patient.id,
      startPointId: event.startPoint != null ? event.startPoint.id : "null",
      endPointId: event.endPoint != null ? event.endPoint.id : "null",
    },
    description: ''
  }
  return eventInput;
}

/** Drriver color map */
createDriverColorMap(keys, vals) {
  var map = new Map()
  keys.forEach(function (key, index) {
    map[key] = vals[index];
  });
  this.driverColorMap = map;
  console.log("Driver-Color MAP : " + JSON.stringify(this.driverColorMap))
}

getColorFromId(id: number): string {
  return this.driverColorMap[id]
}

/** Event form functions */
clearEventForm() {
  this.eventForm.reset();
}

/** Calendar functions */
addToCalendar(event: Evenement) {
  //var eventInput = this.convertEventToEventCalendar(event)
  //this.calendarApi.addEvent(eventInput);
}

addEventsToCalendar(){
  this.events = []
  //Get all events in database and convert them into CalendarEvent draggable and resizable
  this.eventService.getEvents().subscribe(
    (items) => {
      //console.log("Events from db :", JSON.stringify(items))
      items.forEach((item) => {
        var eventCalendar = this.convertEventToEventCalendar(item)
        console.log("EVENT CALENDAR CONVERTED : ", JSON.stringify(eventCalendar))
        this.events.push(
        {
          title: eventCalendar.title,
          color: colors.yellow,
          start: new Date(eventCalendar.start),
          end: new Date(eventCalendar.end),
          actions: this.actions,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
          draggable: true,
          meta: {
            item // Add event item to CalendarEvent
          }
        }
      )})
    })
}

populateLists() {
  this.driverService.getDrivers().subscribe((items) => {
    this.driverList = items,
      console.log(items);
  });

  this.patientService.getPatients().subscribe((items) => {
    this.patientList = items,
      console.log(items);
  });

  this.placeService.getPlaces().subscribe((items) => {
    this.placeList = items,
      console.log(items);
  });

  this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
    (item) => { this.selectedPatient = item });

  this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
    (item) => { this.selectedStarPoint = item });

  this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
    (item) => { this.selectedEndPoint = item });
}
}

/** ------------- Alerts ------------- */
function alertWithSuccess(message) {
  Swal.fire('Ajout/Modification d\'évènement', message, 'success')
}

function errorAlert() {
  Swal.fire({
    icon: 'error',
    title: 'Echec de l\'ajout',
    text: 'Quelque chose s\'est mal passé!',
    footer: '<a href>Contacter le service</a>'
  })
}

/** Transformation (number, date, ...) */
function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

function getTimezoneOffsetString(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset();
  const hoursOffset = String(
    Math.floor(Math.abs(timezoneOffset / 60))
  ).padStart(2, '0');
  const minutesOffset = String(Math.abs(timezoneOffset % 60)).padEnd(2, '0');
  const direction = timezoneOffset > 0 ? '-' : '+';

  return `T00:00:00${direction}${hoursOffset}:${minutesOffset}`;
}



