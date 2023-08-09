import {
  Component,
  ElementRef,
  OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import {MessageService} from 'primeng/api';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {PasswordDialogComponent} from './dialogs/password-dialog/password-dialog.component';
import {VncService} from './vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    VncService,
    MessageService,
    DialogService
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('vnc', {static: true}) vnc!: ElementRef;

  isConnecting!: boolean;
  isConnected!: boolean;

  dialogRef!: DynamicDialogRef;

  constructor(private vncService: VncService,
              private dialogService: DialogService) {}

  ngOnInit() {
    this.vncService.isConnecting$
      .pipe(untilDestroyed(this))
      .subscribe((isConnecting: boolean) => this.isConnecting = isConnecting);
    this.vncService.isConnected$
      .pipe(untilDestroyed(this))
      .subscribe((isConnected: boolean) => this.isConnected = isConnected);
  }

  onConnectDialog(): void {
    if (this.vncService.isRFB()) {
      return;
    }
    this.dialogRef = this.dialogService.open(PasswordDialogComponent, {
      header: 'Пароль подключения',
      width: '500px'
    });
    this.dialogRef.onClose
      .pipe(untilDestroyed(this))
      .subscribe((password: string | undefined) => {
        if (password) {
          this.vncService.start(this.vnc.nativeElement, '192.168.50.200', password);
        }
      });
  }

  ngOnDestroy() {
    this.vncService.stop();
    if (this.dialogRef) {
      this.dialogRef.destroy();
    }
  }
}
