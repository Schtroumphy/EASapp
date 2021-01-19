import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
import { COLORS, FORMAT_HH_mm, FORMAT_yyyy_MM_dd } from '../core/constants';
import { DatePipe } from '@angular/common';
import { AdvancedConsoleLogger } from 'typeorm';
import { finalize } from 'rxjs/internal/operators/finalize';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  eventList: Evenement[];
  driverList: Driver[];
  patientList: Patient[];
  placeList: Place[];
  displayForm = false;
  displayFilteredForm = false;
  updateEvent = false;
  eventForm: FormGroup
  filterForm: FormGroup
  displayTimeViewFilter = false
  displayEventClickedDetails = false

  //Form
  newEvent = false;
  updatingEvent = false;
  startHourSelected: string;

  //drag drop variables
  displayChangesMsg = false;
  eventChangesList: Evenement[] = []
  loading: boolean = true;

  selectedStartPointId: string
  selectedStarPoint: Place
  selectedEndPoint: Place
  selectedEndPointId: string
  selectedDriverId: string
  selectedDriver: Driver
  selectedPatientId: string
  selectedPatient: Patient
  dateSelected: string
  selectedJourneyId : string
  favoriteTimeView: string
  selectedFilteredDriverId1: string
  selectedFilteredDriverId2: string
  startHourFilterSelected : string
  endHourFilterSelected : string

  hours_job: string[] = [];
  hours_job_from: string[] = [];
  filterAfterRedirectionFromdriverPage : boolean = false

  //Map driver-color
  driverColorMap: Map<string, string> = new Map();

  eventPicked: string;
  calendarApi: Calendar;
  eventToUpdate: Evenement
  eventIdClicked: number;
  eventClicked: any;
  calendarOptions: CalendarOptions
  // references the #calendar in the template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;


  ngAfterViewInit(): void {
    this.calendarApi = this.calendarComponent.getApi();
    this.getAllEvents();

    this.eventList.forEach((item) => {
      this.addToCalendar(item);
    })

    if(this.filterAfterRedirectionFromdriverPage){
      console.log("FILTER")
      this.onFilterSubmit()
    }
  }

  constructor(private eventService: EventService, private driverService: DriverService, private patientService: PatientService, 
    private placeService: PlaceService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute) {
    console.log()
    // Synchrone
    console.log("P1 Synchrone : " + this.route.snapshot.params['p1']);

    if(this.route.snapshot.params['p1'] !== null && this.route.snapshot.params['p1'] !== undefined){
      this.filterAfterRedirectionFromdriverPage = true
      this.selectedFilteredDriverId1 = this.route.snapshot.params['p1']
    }
  }

  ngOnInit(): void {
    this.initForm();

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
    this.createDriverColorMap(this.driverList.map(e => e.id), COLORS)
    this.initCalendar()
    this.hours_job = Array.from(Array(23).keys()).map(x => {
      if(x<10){
        return "0" + x
      } else {
        return "" + x
      }
    }).filter(x => parseInt(x) > 7 && parseInt(x)  < 23)
  }

  createDriverColorMap(keys, vals) {
    var map = new Map()
    keys.forEach(function (key, index) {
      map[key] = vals[index];
    });
    this.driverColorMap = map;
    console.log("Driver-Color MAP : " + JSON.stringify(this.driverColorMap))
  }

  getAllEvents() {
    this.eventService.getEvents().subscribe((items) => (this.eventList = items));
  }

  initCalendar() {
    this.calendarOptions = {
      locale: 'fr',
      firstDay: 1,
      weekends: true,
      allDaySlot: false,
      displayEventTime: true,
      allDayText: "Journée entière",
      slotMinTime: "8:00",
      slotMaxTime: "22:00",
      themeSystem: 'bootstrap',
      initialView: 'listWeek',
      timeZone: 'local',
      eventTextColor: 'white',
      editable: true,
      droppable: true,
      slotDuration: '00:15',
      buttonText: {
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour',
        list: 'Jour',
      },
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek listWeek',
      },
      titleFormat: { // will produce something like "Tuesday, September 18, 2018"
        month: 'short',
        year: 'numeric',
        day: 'numeric',
        weekday: 'long',
        omitCommas: true,
        hour12: false,
        meridiem: false
      },

      eventDragStop: null,
      eventDrop: this.alertChangesEnd.bind(this),
      eventClick: this.handleEventClick.bind(this),
      events: [
      ],
      views: {
        timeGridWeek: { // week view
          displayEventTime: false,
          // other view-specific options here
        },
        listWeek: {
        }
      }
    };
  }

  alertChangesEnd(info) {
    //Alert the user of changes
    this.displayChangesMsg = true;
    var eventConverted = this.convertEventCalendarToEvent(info.event)

    //Add it to changed event array
    this.eventChangesList.push(eventConverted)
  }

  handleEventClick(event) {
    this.displayEventClickedDetails = true;
    this.eventIdClicked = event.event.extendedProps.eventId

    this.eventService.getEventById(event.event.extendedProps.eventId).subscribe(
      (item) => {
        this.eventClicked = item;
      });
  }

  //Forms
  initForm() {
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

    this.filterForm = new FormGroup({
      driver1: new FormControl(null),
      driver2: new FormControl(),
      startHourFilterSelected : new FormControl(null),
      endHourFilterSelected : new FormControl(),
    })
  }

  onFilterSubmit() {
    this.eventList = []
    this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId1)).subscribe((items) => {
      this.eventList = this.eventList.concat(items);
    }
    )
    if (this.selectedFilteredDriverId1 != null) {
      this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId2)).subscribe((items) => {
        this.eventList = this.eventList.concat(items);
      }
      )
    }

    if(this.startHourFilterSelected !==null){
      if(this.endHourFilterSelected !== null){

      } else {
        this.startHourFilterSelected = ""
      }
    }

    this.updateCalendar()
  }

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
    eventToAddToDB.date = this.eventForm.get('date').value
    eventToAddToDB.startPoint = this.selectedStarPoint
    eventToAddToDB.endPoint = this.selectedEndPoint
    eventToAddToDB.startHour = this.eventForm.get('startHour').value
    eventToAddToDB.endHour = this.eventForm.get('endHour').value

    if (this.newEvent) {
      this.eventService.addEventAndGetId(eventToAddToDB).subscribe(
        (events) => {
          this.eventList = events[1]
          var eventIdAdded = events[0]
          eventToAddToDB.id = eventIdAdded //add id to the freshly added event to retrieve it after click
          this.alertWithSuccess('L\'évènement a été ajouté avec succès')
          this.clearEventForm()
          this.displayForm = false;
          var eventInput = this.convertEventToEventCalendar(eventToAddToDB)
          this.calendarApi.addEvent(eventInput);
        },
        (error) => this.errorAlert()
      );
    } else if (this.updatingEvent) {
      eventToAddToDB.id = this.eventForm.get('id').value
      this.eventService.updateEvent(eventToAddToDB).subscribe(
        (events) => {
          this.eventList = events;
          this.eventList.forEach(element => {
          });
          this.updateCalendar();
          this.alertWithSuccess('L\'évènement a été modifié avec succès')
          this.clearEventForm()
        }
      )
    }
  }

  addToCalendar(event: Evenement) {
    var eventInput = this.convertEventToEventCalendar(event)
    this.calendarApi.addEvent(eventInput);
  }

  updateCalendar() {
    this.calendarApi.removeAllEvents();
    this.eventList.forEach((item) => {
      this.addToCalendar(item);
    })
  }

  convertEventCalendarToEvent(eventCalendar): Evenement {
    var event = new Evenement();

    //If event has already been changed and have been add to event list changes
    if (this.eventChangesList.some(e => e.id === eventCalendar.extendedProps.eventId)) {
      //get event from array thanks to id 
      var eventFound = this.eventChangesList.find(e => e.id == eventCalendar.extendedProps.eventId)
      this.eventChangesList = this.eventChangesList.filter(obj => obj !== eventFound);

      //Already in eventChangesList
      eventFound.date = this.datePipe.transform(eventCalendar.start, FORMAT_yyyy_MM_dd)
      eventFound.startHour = this.datePipe.transform(eventCalendar.start, FORMAT_HH_mm)
      eventFound.endHour = this.datePipe.transform(eventCalendar.end, FORMAT_HH_mm)
      event = eventFound

    } else {
      //New change
      event.id = eventCalendar.extendedProps.eventId
      event.title = eventCalendar.title
      event.date = this.datePipe.transform(eventCalendar.start, FORMAT_yyyy_MM_dd)
      event.startHour = this.datePipe.transform(eventCalendar.start, FORMAT_HH_mm)
      event.endHour = this.datePipe.transform(eventCalendar.end, FORMAT_HH_mm)

      //Driver
      this.driverService.getDriverById(parseInt(eventCalendar.extendedProps.driverId)).subscribe(
        (item) => { event.driver = item });

      //Patient
      this.patientService.getPatientById(parseInt(eventCalendar.extendedProps.patientId)).subscribe(
        (item) => { event.patient = item });

      //Places start and end
      this.placeService.getPlaceById(parseInt(eventCalendar.extendedProps.startPointId)).subscribe(
        (item) => { event.startPoint = item });

      this.placeService.getPlaceById(parseInt(eventCalendar.extendedProps.endPointId)).subscribe(
        (item) => { event.endPoint = item });
    }
    return event;
  }

  convertEventToEventCalendar(event: Evenement) {
    var dateEv = event.date;
    var startTimeEv = event.startHour;
    var endTimeEv = event.endHour;
    var i = 1;

    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    var eventInput = {
      title: event.patient.firstname + " " + event.patient.lastname.toUpperCase() + "\n | " + event.driver.firstname + "\n | " + event.startPoint.label + " - " + event.endPoint.label,
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

  getColorFromId(id: number): string {
    return this.driverColorMap[id]
  }

  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification d\'évènement', message, 'success')
  }

  errorAlert() {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé!',
      footer: '<a href>Contacter le service</a>'
    })
  }

  clearEventForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  clearFilterForm() {
    this.filterForm.reset()
    this.displayFilteredForm = false
  }

  displayFilterForm(hideOrNot: boolean) {
    (hideOrNot) ? this.displayFilteredForm = true : this.displayFilteredForm = false;
  }

  //Ajouter un evenement
  displayEventForm(newEvent: boolean) {
    this.displayForm = true;
    if (newEvent) {
      this.newEvent = true;
      this.updatingEvent = false;
    } else {
      this.updatingEvent = true;
      this.newEvent = false;
    }

  }

  editEvent(event) {
    this.displayEventClickedDetails = false;
    this.displayEventForm(false); //false = not new event
    this.eventForm.controls["id"].setValue(event.id);
    this.selectedDriverId = event.driver.id;
    this.selectedPatientId = event.patient.id;
    this.selectedStartPointId = event.startPoint.id;
    this.selectedEndPointId = event.endPoint.id;
    this.eventForm.controls["date"].setValue(event.date);
    this.eventForm.controls["startHour"].setValue(event.startHour);
    this.eventForm.controls["endHour"].setValue(event.endHour);
  }

  displayEventDetails(eventId) {
    this.updateEvent = !this.updateEvent;
    this.eventService.getEventById(eventId).subscribe((eventFound) => {
      this.eventToUpdate = eventFound;
    })

  }

  deleteEventBox(eventId) {
    Swal.fire({
      title: 'Etes-vous sûr de vouloir supprimer cet évènement ?',
      text: 'La suppression est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sûr',
      cancelButtonText: 'Non, je le garde'
    }).then((result) => {
      if (result.value) {
        this.eventService
          .deleteEvent(eventId)
          .subscribe(
            (events) => {
              this.eventList = events
              this.updateCalendar();
              Swal.fire(
                'Supprimé!',
                'L\'évènement a bien été supprimé.',
                'success'
              )
              this.displayEventClickedDetails = false;
            },
            (error) => {
              Swal.fire(
                'Erreur',
                'Echec de la suppression',
                'error'
              )
            }
          );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire(
          'Annulé',
          'Suppression annulée',
          'error'
        )
      }
    })
  }

  clearFilter() {
    this.getAllEvents()
    this.updateCalendar()
  }

  displayEventClicked(hideOrNot) {
    this.displayEventClickedDetails = hideOrNot;
  }

  deleteEventById(eventId) {
    this.deleteEventBox(eventId);
  }

  saveChanges() {
    this.displayChangesMsg = false
    this.loading = true

    this.eventChangesList.forEach((eventToUpdate) => {
      this.eventService.updateEvent(eventToUpdate).subscribe(
        (events) => {
          this.eventList = events;
          this.updateCalendar();
        }
      )
      this.loading = false
      this.alertWithSuccess('Les modifications ont été pris en compte.')
    })
  }

  clearChanges() {
    this.eventChangesList = [];
    this.displayChangesMsg = false
    this.updateCalendar()
  }

  updateHoursJobFrom() {
    this.hours_job_from = this.hours_job.filter(e => parseInt(e) > parseInt(this.startHourFilterSelected))
  }

}


