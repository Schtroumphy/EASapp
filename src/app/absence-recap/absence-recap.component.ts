import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Absence } from 'app/core/models/absence.schema';
import { Driver } from 'app/core/models/driver.schema';
import { AbsenceService } from 'app/core/services/app/absence.service';
import { endOfWeek, startOfWeek, getDaysInMonth, startOfMonth, endOfMonth, addDays, subMonths, addMonths, getMonth } from 'date-fns';
import { FORMAT_dd_MM_yyyy, FORMAT_yyyy_MM_dd } from 'app/core/constants';
import { DriverService } from 'app/core/services/app/driver.service';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-absence-recap',
  templateUrl: './absence-recap.component.html',
  styleUrls: ['./absence-recap.component.scss']
})
export class AbsenceRecapComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  displayedColumns = ['id', 'driver', 'startDate', 'endDate', 'reason', 'actions'];
  columnsToDisplay: string[] = this.displayedColumns.slice();

  absenceList: Absence[] = [];
  absenceFilterList: Absence[] = [];
  driverList: Driver[] = [];

  // Absence array
  employeeList: Driver[] = []
  dayOfMonth: string[] = []
  selectableClass = "absence-cell"
  unselectableClass = "no-absence"
  cellIds = Array()

  // Form (edit absence) 
  editAbsenceForm : FormGroup
  selectedDriverId: number;
  selectedStartDate: string;
  selectedEndDate: string;
  selectedReason: string;
  selectedAbsenceId : number;

  // Dates
  currentWeekStartDate = null
  currentWeekEndDate = null
  currentDate = null
  currentMonthStartDate = null
  currentMonthEndDate = null

  // Modal
  modalReference: any;
  modalData: {
    action: string;
    absence: Absence;
  };

  constructor(private modal: NgbModal, private absenceService : AbsenceService, private driverService: DriverService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.initForm()
    this.getDriverList()

    this.currentDate = new Date()
    console.log("Current date : ", JSON.stringify(this.currentDate))
    this.currentMonthStartDate = startOfMonth(new Date());
    this.currentMonthEndDate = endOfMonth(new Date());
    console.log("Current month start date : ", (this.currentMonthStartDate))
    console.log("Current month end date : ", (this.currentMonthEndDate))

    this.updateDaysInMonth()

    this.absenceService.getAllAbsences().subscribe((absences) => {
      this.absenceList = absences
      this.absenceFilterList = absences
      this.updateAbsenceFilter()
    });
    console.log("All absences : " + JSON.stringify(this.absenceList))
  }

  getDriverList() {
    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items,
        console.log(items);
        
          this.updateAbsenceCells()        
    });
  }

  // -------------- Absence edit form --------------

  initForm() {
    this.editAbsenceForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl('', Validators.required),
      startDate: new FormControl('', [Validators.required]),
      endDate:new FormControl('', Validators.required),
      reason:new FormControl(''),
    })
  }

  onSubmit(){
    console.log("Submit UPDATE")
    // Update absence
    let absence = new Absence(
      this.editAbsenceForm.get('startDate').value,
      this.editAbsenceForm.get('endDate').value,
      this.editAbsenceForm.get('reason').value
    );
    this.driverService.getDriverById(this.selectedDriverId).subscribe(
      (item) => { 
        absence.driver = item
       });
    absence.id = this.selectedAbsenceId
    console.log("Absence to update : " + JSON.stringify(absence))
    
    this.absenceService.updateAbsence(absence).subscribe(
      (absences) => {
        console.log("Absence updated : " + JSON.stringify(absence))
        // Update absences list 
        this.absenceList = absences
        this.absenceFilterList = absences
        this.updateAbsenceFilter()
        this.alertWithSuccess("L'absence a été modifié avec succès")
        this.clearEditAbsenceForm()
      })

      this.updateAbsenceCells()
  }

  fillEditAbsenceForm(absence : Absence) {
    console.log("fillEditAbsenceForm with absence : " + JSON.stringify(absence))
    this.selectedDriverId = absence.driver.id;
    this.selectedStartDate = absence.startDate.toString();
    this.selectedEndDate = absence.endDate.toString();
    this.selectedReason = absence.reason;
  }

  displayEditAbsenceModal(action: string, absence: Absence): void {
    console.log("Absence to edit : " + JSON.stringify(absence))
    this.fillEditAbsenceForm(absence)
    this.selectedAbsenceId = absence.id
    this.modalData = { absence, action };
    this.modalReference = this.modal.open(this.modalContent, { size: 'lg' });
  }

  clearEditAbsenceForm() { 
    this.closeModal()
    this.editAbsenceForm.reset();
  }

  deleteAbsence(absenceId) {
    console.log("Absence id to delete : "+ absenceId)
    Swal.fire({
      title: 'Etes-vous sûr de vouloir supprimer cet absence ?',
      text: 'La suppression est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, sûr',
      cancelButtonText: 'Non, je le garde'
    }).then((result) => {
      if (result.value) {
        this.absenceService
          .deleteAbsence(absenceId)
          .subscribe(
            (absences) => {
              this.absenceList = absences
              this.updateAbsenceFilter()

              Swal.fire(
                'Supprimé!',
                'L\'absence a bien été supprimé.',
                'success'
              )
            },
            (error) => {
              Swal.fire(
                'Erreur',
                'Echec de la suppression : ' + error,
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

  closeModal(){
    this.modalReference.close()
  }

  // -------------- All for array recap ------------------

  getDatesBetween(startDate, endDate){
    const listDate = [];
    const dateMove = new Date(startDate);
    let strDate = startDate;

    while (strDate < endDate) {
      strDate = dateMove.toISOString().slice(0, 10);
      console.log("STR DATE : ", strDate)
      listDate.push(strDate);
      dateMove.setDate(dateMove.getDate() + 1);
      console.log("STR DATE + 1 : ", dateMove)
    };
    console.log("List dates : ", listDate)
    return listDate
  }

  updateAbsenceCells() {
    this.driverList.forEach(driver => {
      const absences = driver.absences
      const driverId = driver.id
      if(absences.length > 0){
        absences.forEach( absence => {
          if(absence.startDate == absence.endDate){
            this.cellIds.push(driverId + "|"+ absence.startDate);
          } else {
            this.getDatesBetween(absence.startDate, absence.endDate).forEach( date => {
              this.cellIds.push(driverId + "|"+ date);
            })
            console.log("Dates between " + absence.startDate + " et " + absence.endDate + " : " + this.getDatesBetween(absence.startDate, absence.endDate))
          }
          
        }
        )
      }
    })
    console.log("Cell ids concerned :" + this.cellIds)
  }

  getPreviousMonth() {
    console.log("New previous current date before ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = subMonths(this.currentDate, 1)
    console.log("New previous current date ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))

    this.updateDaysInMonth()
  }

  getNextMonth() {
    console.log("Current date before add month ", this.datePipe.transform(this.currentDate, FORMAT_yyyy_MM_dd))

    this.currentDate = addMonths(this.currentDate, 1)
    console.log("Current date after add month  ", this.datePipe.transform(this.currentDate, FORMAT_dd_MM_yyyy))
    this.updateDaysInMonth()
  }

  updateDaysInMonth() {
    let currentMonthStartDate = this.datePipe.transform(startOfMonth(this.currentDate), FORMAT_yyyy_MM_dd)
    let currentMonthEndDate = this.datePipe.transform(endOfMonth(this.currentDate), FORMAT_yyyy_MM_dd)

    var i = 0
    this.dayOfMonth = []
    while (i < getDaysInMonth(this.currentDate)) {

      //console.log("Current start month date ADD DAYS ", i, " : ", new Date(currentMonthStartDate))
      //console.log("ADD DAYS ", i, " : ", (addDays(new Date(currentMonthStartDate), i)))

      this.dayOfMonth.push(
        this.datePipe.transform(addDays(new Date(currentMonthStartDate), i), FORMAT_yyyy_MM_dd))
      i++
    }

    this.updateAbsenceFilter()
  }


  getDateFromId(selectedId: any) {
    return selectedId.split("|")[1]
  }

  getDriverFromCellId(selectedId: any) {
    return selectedId.split("|")[0]
  }

  getCellIdFromDriverAndDate(driverId: String, date: String) {
    return driverId + "-" + date
  }

  /**
    * Method called when the user click with the right button
    * @param event MouseEvent, it contains the coordinates
    * @param item Our data contained in the row of the table
    */
  onRightClick(event: MouseEvent) {
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
  }

  getCurrentWeekPeriod(date: Date) {
    this.currentWeekStartDate = this.datePipe.transform(startOfWeek(date, { weekStartsOn: 1 }), FORMAT_dd_MM_yyyy);
    //console.log("Start week date : ", this.currentWeekStartDate)
    this.currentWeekEndDate = this.datePipe.transform(endOfWeek(date, { weekStartsOn: 1 }), FORMAT_dd_MM_yyyy);
    //console.log("End week date : ", this.currentWeekEndDate)
  }

  // Alerts
  alertWithSuccess(message) {
    Swal.fire('Ajout/Modification d\'évènement', message, 'success')
  }

  updateAbsenceFilter() {
    console.log("updateAbsenceFilter current date "+ this.currentDate)
    const zero = "0"
    const month = getMonth(this.currentDate) + 1
    var monthString = "-"
    if(month < 10){
      monthString = monthString + zero + month + "-"
    } else {
      monthString = monthString + month + "-"
    }
    console.log("updateAbsenceFilter month "+ month)
    console.log("updateAbsenceFilter month  string"+ monthString)

    this.absenceFilterList = this.absenceList.filter(absence => absence.startDate.includes(monthString) || absence.endDate.includes(monthString));
    console.log("ABSENCE FILTER : "+ JSON.stringify(this.absenceFilterList))
  }
}

