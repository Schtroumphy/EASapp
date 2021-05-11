import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, Calendar } from '@fullcalendar/angular'; // useful for typechecking
import { Evenement } from '../core/models/evenement.schema';
import { EventService } from '../core/services/app/event.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Driver } from '../core/models/driver.schema';
import { DriverService } from '../core/services/app/driver.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { PatientService } from '../core/services/app/patient.service';
import { Patient } from '../core/models/patient.schema';
import { PlaceService } from '../core/services/app/place.service';
import { Place } from '../core/models/place.schema';
import { COLORS, FORMAT_dd_MM_yyyy, FORMAT_HH_mm, FORMAT_yyyy_dd_MM, FORMAT_yyyy_MM_dd } from '../core/constants';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  @ViewChild('modalInfoContent', { static: true }) modalInfoContent: TemplateRef<any>;
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

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
  startCalendarTime = "8:00"
  endCalendarTime = "22:00"

  //Form
  newEvent = false;
  updatingEvent = false;
  eventIdSelected : string;
  startHourSelected: string;
  endHourSelected: string;

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
  selectedJourneyId: string
  favoriteTimeView: string

  // Filters
  selectedFilteredDriverId1: string
  selectedFilteredDriverId2: string
  startHourFilterSelected: string
  endHourFilterSelected: string
  frequencySelected: string

  hours_job: string[] = [];
  hours_job_from: string[] = [];
  frequencyArray: string[] = [];
  filterAfterRedirectionFromdriverPage: boolean = false

  //Map driver-color
  driverColorMap: Map<string, string> = new Map();

  // Modal
  modalReference: any;
  modalInfoData: {
    event: Evenement;
  };
  modalData: {
    action: string;
    event: Evenement;
  };
  pipe = new DatePipe('fr');

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

    this.updateCalendar()

    if (this.filterAfterRedirectionFromdriverPage) {
      console.log("FILTER")
      this.onFilterSubmit()
    }
  }

  constructor(private modal: NgbModal, private eventService: EventService, private driverService: DriverService, private patientService: PatientService,
    private placeService: PlaceService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute) {
    console.log()
    // Synchrone
    console.log("P1 Synchrone : " + this.route.snapshot.params['p1']);

    // Filter the calendar if a driver is given in route parameter
    if (this.route.snapshot.params['p1'] !== null && this.route.snapshot.params['p1'] !== undefined) {
      this.filterAfterRedirectionFromdriverPage = true
      this.selectedFilteredDriverId1 = this.route.snapshot.params['p1']
    }
  }

  ngOnInit(): void {
    this.initForms(); // Event and filter forms

    this.populateLists();
    
    this.createDriverColorMap(this.driverList.map(e => e.id), COLORS)

    this.initCalendar()

    //TODO Comment
    this.hours_job = Array.from(Array(23).keys()).map(x => {
      if (x < 10) {
        return "0" + x
      } else {
        return "" + x
      }
    }).filter(x => parseInt(x) > 7 && parseInt(x) < 23)

    this.frequencyArray = ["05", "10", "15", "30"]
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
      slotMinTime: '8:00',
      slotMaxTime: '22:00',
      themeSystem: 'bootstrap',
      initialView: 'timeGridWeek',
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
      eventResize: this.alertChangesEnd.bind(this),
      eventClick: this.displayEventInfoModal.bind(this),
      dateClick: this.onDayClicked.bind(this),
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

  /** Modals */
  displayEventInfoModal(event): void {
    this.eventService.getEventById(event.event.extendedProps.eventId).subscribe(
      (item) => {
        this.eventClicked = item;
      });
    console.log("Event clicked : ", JSON.stringify(this.eventClicked))

    this.modalReference = this.modal.open(this.modalInfoContent, { backdrop : 'static', size: 'lg', keyboard : false, centered : true });
  }

  closeModal(){
    this.modalReference.close()
  }

  /** Add event on click on day */
  onDayClicked(info){
    // Add date and time selected to event
    var eventToAdd = new Evenement()
    eventToAdd.date = this.datePipe.transform(info.dateStr, FORMAT_dd_MM_yyyy)
    eventToAdd.startHour = this.datePipe.transform(info.dateStr, FORMAT_HH_mm)
    eventToAdd.endHour = this.pipe.transform(new Date(new Date(info.dateStr).getTime() + 15 * 60000), 'shortTime')

    // Keep these information to add event on submit
    this.dateSelected = eventToAdd.date
    this.startHourSelected = eventToAdd.startHour
    this.endHourSelected = eventToAdd.endHour

    console.log("Event to add : ", JSON.stringify(eventToAdd))
    this.modalData = { action : "Add new event", event : eventToAdd }
    this.displayEventForm(true); //true = new event
    this.displayEditEventModal("Add event", eventToAdd)
  }

  displayEditEventModal(action: string, event: Evenement): void {
    this.modalData = { event, action };
    this.modalReference = this.modal.open(this.modalContent, { size: 'lg' });
  }

  //Forms
  initForms() {
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
      driver1: new FormControl(),
      driver2: new FormControl(),
      startHourFilterSelected: new FormControl(),
      endHourFilterSelected: new FormControl(),
      frequencySelected: new FormControl(),
    })
  }

  onFilterSubmit() {
    if (this.selectedFilteredDriverId1 != null) {
      this.eventList = []
      this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId1)).subscribe((items) => {
        this.eventList = this.eventList.concat(items);
      }
      )
    }
    if (this.selectedFilteredDriverId2 != null) {
      if (this.selectedFilteredDriverId1 == null) {
        this.eventList = []
      }
      this.eventService.getEventsByDriverId(parseInt(this.selectedFilteredDriverId2)).subscribe((items) => {
        this.eventList = this.eventList.concat(items);
      }
      )
    }

    console.log("FILTRES HEURES : " + this.startHourFilterSelected + " - " + this.endHourFilterSelected)
    if (this.startHourFilterSelected == null || this.endHourFilterSelected == null) {
      console.log("Un filtre heure est nul")
      this.startHourFilterSelected = ""
      this.endHourFilterSelected = ""
    } else {
      console.log("DEUX HORAIRS FILTER NON NUL")
      console.log("Les 2 filtres heure sont non nul ")
      this.calendarApi.setOption("slotMinTime", this.startHourFilterSelected + ":00:00");
      this.calendarApi.setOption("slotMaxTime", this.endHourFilterSelected + ":00:00");
    }
    console.log("Fréquence selected : " + this.frequencySelected)
    if (this.frequencySelected) {
      console.log("Freq non null")
      this.calendarApi.setOption("slotDuration", "00:" + this.frequencySelected);
    }

    this.updateCalendar()
    this.filterForm.reset()
  }

  onSubmit() {
    console.log("ON SUBMIT")
    this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
      (item) => { this.selectedDriver = item });
      console.log("Driver selected : ", JSON.stringify(this.selectedDriver))

    this.patientService.getPatientById(parseInt(this.selectedPatientId)).subscribe(
      (item) => { this.selectedPatient = item });
      console.log("Patient selected : ", JSON.stringify(this.selectedPatient))

    this.placeService.getPlaceById(parseInt(this.selectedStartPointId)).subscribe(
      (item) => { this.selectedStarPoint = item });
      console.log("StartPlace selected : ", JSON.stringify(this.selectedStarPoint))

    this.placeService.getPlaceById(parseInt(this.selectedEndPointId)).subscribe(
      (item) => { this.selectedEndPoint = item });
      console.log("End point selected : ", JSON.stringify(this.selectedEndPoint))

    var eventToAddToDB = new Evenement();
    eventToAddToDB.title = this.selectedPatient.firstname + " " + this.selectedPatient.lastname.toUpperCase(); 
    eventToAddToDB.patient = this.selectedPatient;
    eventToAddToDB.driver = this.selectedDriver
    //new Date(year, month, day, hours, minutes, seconds, milliseconds)	
    // CAREFUL : month are 0 based, so mins 1 to have the good date
    console.log("DATE TO CONVERT ", JSON.stringify(this.dateSelected))
    if(this.updatingEvent){
      eventToAddToDB.date = this.dateSelected
    } else {
      eventToAddToDB.date = this.datePipe.transform(new Date(parseInt(this.dateSelected.split("-")[2]), parseInt(this.dateSelected.split("-")[1])-1, parseInt(this.dateSelected.split("-")[0])), FORMAT_yyyy_MM_dd) 
    } 
    console.log("DATE CONVERTED ", JSON.stringify(eventToAddToDB.date))
    eventToAddToDB.startPoint = this.selectedStarPoint
    eventToAddToDB.endPoint = this.selectedEndPoint
    eventToAddToDB.startHour = this.startHourSelected
    eventToAddToDB.endHour = this.endHourSelected
    console.log("Event to save : ", JSON.stringify(eventToAddToDB))

    if (this.newEvent) {
      console.log("IS NEW EVENT")
      this.eventService.addEventAndGetId(eventToAddToDB).subscribe(
        (pairEentIdEvents) => {
          this.eventList = pairEentIdEvents[1]
          var eventIdAdded = pairEentIdEvents[0]
          eventToAddToDB.id = eventIdAdded //add id to the freshly added event to retrieve it after click
          this.alertWithSuccess('L\'évènement a été ajouté avec succès')
          
          var eventInput = this.convertEventToEventCalendar(eventToAddToDB)
          this.calendarApi.addEvent(eventInput);
          this.updateCalendar();
        },
        (error) => this.errorAlert(error)
      );
    } else if (this.updatingEvent) {
      console.log("IS UPDATING EVENT")
      eventToAddToDB.id = parseInt(this.eventIdSelected)
      this.eventService.updateEvent(eventToAddToDB).subscribe(
        (events) => {
          this.eventList = events;
          this.updateCalendar();
          this.alertWithSuccess('L\'évènement a été modifié avec succès')
          this.clearEventForm()
        }
      )
    }
    this.clearEventForm()
    this.closeModal()
  }


  clearEventForm() {
    this.eventForm.reset();
    this.displayForm = false;
  }

  clearFilterForm() {
    this.filterForm.reset()
    this.displayFilteredForm = false
    this.filterForm.controls["driver1"].setValue("");
    this.selectedFilteredDriverId1 = ""
    this.calendarApi.setOption("slotMinTime", "08:00:00");
    this.calendarApi.setOption("slotMaxTime", "22:00:00");
    this.calendarApi.setOption("slotDuration", "00:15");
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

  /** CALENDAR FUNCTIONS */
  addToCalendar(event: Evenement) {
    var eventInput = this.convertEventToEventCalendar(event)
    this.calendarApi.addEvent(eventInput);
  }

  updateCalendar() {
    this.calendarApi.removeAllEvents();
    console.log("event list " + JSON.stringify(this.eventList))
    this.eventList.forEach((item) => {
      this.addToCalendar(item);
    })
  }

  convertEventCalendarToEvent(eventCalendar): Evenement {
    var event = new Evenement();
    console.log("CALENDAR EVENT : ", JSON.stringify(eventCalendar))

    //If event has already been changed and have been add to event list changes
    if (this.eventChangesList.some(e => e.id === eventCalendar.extendedProps.eventId)) {
      //get event from array thanks to id 
      var eventFound = this.eventChangesList.find(e => e.id == eventCalendar.extendedProps.eventId)
      this.eventChangesList = this.eventChangesList.filter(obj => obj !== eventFound);

      //Already in eventChangesList
      eventFound.date = this.datePipe.transform(eventCalendar.start, FORMAT_yyyy_MM_dd)
      eventFound.startHour = this.datePipe.transform(eventCalendar.start, FORMAT_HH_mm)
      eventFound.endHour = this.datePipe.transform(eventCalendar.end, FORMAT_HH_mm)
      console.log("NEW END CALENDAR: ", eventCalendar.end)
      console.log("NEW END : ", eventFound.endHour)
      event = eventFound

    } else {
      //New change
      event.id = eventCalendar.extendedProps.eventId
      event.title = eventCalendar.title
      event.date = this.datePipe.transform(eventCalendar.start, FORMAT_yyyy_MM_dd)
      event.startHour = this.datePipe.transform(eventCalendar.start, FORMAT_HH_mm)
      event.endHour = this.datePipe.transform(eventCalendar.end, FORMAT_HH_mm)
      console.log("NEW END CALENDAR: ", eventCalendar.end)
      console.log("NEW END : ", event.endHour)

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
      title: event.patient.firstname + " " + event.patient.lastname.toUpperCase() + "\n | " + event.driver.firstname + "\n | ",
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

  /** OTHER FUNCTIONS */
  getColorFromId(id: number): string {
    return this.driverColorMap[id]
  }

  /** ALERTS  */

  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification d\'évènement', message, 'success')
  }

  errorAlert(error) {
    Swal.fire({
      icon: 'error',
      title: 'Echec de l\'ajout',
      text: 'Quelque chose s\'est mal passé! : ' + error,
      footer: '<a href>Contacter le service</a>'
    })
  }

  editEvent(event) {
    this.closeModal()

    this.displayEventClickedDetails = false;
    this.eventIdSelected = event.id
    this.dateSelected = event.date
    this.startHourSelected = event.startHour
    this.endHourSelected = event.endHour
    this.displayEventForm(false); //false = not new event
    this.displayEditEventModal("Edit event", event)
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
    this.closeModal()
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

  print() {
    window.print()
  }

}


