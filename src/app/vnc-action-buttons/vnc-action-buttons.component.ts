import {Component, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {VncService} from '../vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-vnc-action-buttons',
  templateUrl: './vnc-action-buttons.component.html',
  styleUrls: ['./vnc-action-buttons.component.scss']
})
export class VncActionButtonsComponent implements OnInit {
  isConnected!: boolean;

  constructor(private vncService: VncService) {}

  ngOnInit() {
    this.vncService.isConnected$
      .pipe(untilDestroyed(this))
      .subscribe((isConnected: boolean) => this.isConnected = isConnected);
  }

  onDisconnectClient(): void {
    this.vncService.stop();
  }
}
