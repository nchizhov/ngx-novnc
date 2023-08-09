import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DynamicDialogRef} from 'primeng/dynamicdialog';

@Component({
  templateUrl: './password-dialog.component.html'
})
export class PasswordDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('focusEl', {static: true}) focusEl!: ElementRef;

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private ref: DynamicDialogRef) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      password: ['']
    });
  }

  ngAfterViewInit() {
    this.focusEl.nativeElement.focus();
  }

  onSubmit(): void {
    this.ref.close(this.form.get('password')?.value);
  }
}
