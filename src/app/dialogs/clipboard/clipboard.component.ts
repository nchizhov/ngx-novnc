import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DynamicDialogRef} from 'primeng/dynamicdialog';

@Component({
  templateUrl: './clipboard.component.html',
  styleUrls: ['./clipboard.component.scss']
})
export class ClipboardDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('focusEl', {static: true}) focusEl!: ElementRef;

  form!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private ref: DynamicDialogRef) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      clipboard: ''
    });
  }

  ngAfterViewInit() {
    this.focusEl.nativeElement.focus();
  }

  onSubmit(): void {
    this.ref.close(this.form.get('clipboard')?.value);
  }

  onReset(): void {
    this.form.reset({
      clipboard: ''
    });
  }
}
