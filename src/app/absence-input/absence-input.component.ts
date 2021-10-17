import { CompileTemplateMetadata } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';
import { Absence } from 'app/core/models/absence.schema';
import { Driver } from 'app/core/models/driver.schema';
import { DriverService } from 'app/core/services/app/driver.service';
import { AbsenceService } from 'app/core/services/app/absence.service';
import { OperatorFunction, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-absences-input',
  templateUrl: './absence-input.component.html',
  styleUrls: ['./absence-input.component.scss']
})
export class AbsenceInputComponent implements OnInit {

  absenceForm: FormGroup
  driverList: Driver[]
  selectedDriverId: string
  selectedDriver : Driver 

  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate;
  fromDateString : String
  toDate: NgbDate | null = null;
  toDateString : String
  public model: any;

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 2 ? []
        : this.driverList.filter(v => v.firstname.toLowerCase().indexOf(term.toLowerCase())).map(it => it.lastname.toUpperCase() + " " + it.firstname ).slice(0, 10))
    )

  constructor(private driverService : DriverService, private absenceService : AbsenceService) { }

  ngOnInit(): void {
    this.initForm()

    this.populateLists()
  }

  //Forms
  initForm() {
    this.absenceForm = new FormGroup({
      id: new FormControl(),
      driver: new FormControl(null, Validators.required),
      daterange: new FormControl(null, Validators.required),
      reason: new FormControl(null),
    })
  }

  populateLists() {
    this.driverService.getDrivers().subscribe((items) => {
      this.driverList = items,
        console.log(items);
    });
  }

  onSubmit() {
    console.log("ON SUBMIT")

    console.log("FROM : " + JSON.stringify(this.fromDate))
    console.log("TO : " + JSON.stringify(this.toDate))


    var endDate : NgbDate
    if(this.toDate == null){ endDate = this.fromDate } else { endDate = this.toDate}

    this.fromDateString = this.formatDate(this.fromDate)
    this.toDateString = this.formatDate(endDate)

    var absenceToAdd = new Absence(
      this.fromDateString,
      this.toDateString
    )

    console.log("Absence : " + JSON.stringify(absenceToAdd))

    this.driverService.getDriverById(parseInt(this.selectedDriverId)).subscribe(
      (item) => { 
        /*if(item.absences == undefined) item.absences = []
        item.absences.push(absenceToAdd)*/
        this.selectedDriver = item 
        console.log("Driver selected :", JSON.stringify(item))
        absenceToAdd.driver = item

        this.absenceService.addAbsence(absenceToAdd).subscribe(
          (absencesDriver) => {
            console.log("Driver absences:", JSON.stringify(absencesDriver))

            this.absenceForm.reset()
            this.alertSuccessSavingAbsence()
            this.fromDateString = ""
            this.toDateString = ""
          }
        )
      });

      console.log("Driver selected with added absence: ", JSON.stringify(this.selectedDriver))
    }

    formatDate(date : NgbDate){
      var month, day
      if(date.month < 10){ month = "0" + date.month } else { month = date.month }
      if(date.day < 10){ day = "0" + date.day } else { day = date.day }
      return date.year + "-" + month + "-" + day
    }

    // --------  Date range selection functions -----------

    onDateSelection(date: NgbDate) {
      if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
      } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
        this.toDate = date;
      } else {
        this.toDate = null;
        this.fromDate = date;
      }
    }
  
    isHovered(date: NgbDate) {
      return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
    }
  
    isInside(date: NgbDate) {
      return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
    }
  
    isRange(date: NgbDate) {
      return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
    }


    // Dialog
    alertSuccessSavingAbsence() {
      Swal.fire({
        title: 'Saisie d\'absence',
        text: 'L\'absence saisie a bien été enregistrée du '+ this.fromDateString + ' au ' + this.toDateString,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Ok',
      })
  
    }
}
