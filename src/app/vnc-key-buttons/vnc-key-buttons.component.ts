import {Component, OnInit} from '@angular/core';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

import {VncService} from '../vnc.service';

@UntilDestroy()
@Component({
  selector: 'app-vnc-key-buttons',
  templateUrl: './vnc-key-buttons.component.html',
  styleUrls: ['./vnc-key-buttons.component.scss']
})
export class VncKeyButtonsComponent implements OnInit {
  private isConnected!: boolean;
  private isView!: boolean;
  isDisabled: boolean = true;

  constructor(private vncService: VncService) {}

  ngOnInit() {
    this.vncService.isConnected$
      .pipe(untilDestroyed(this))
      .subscribe((isConnected: boolean) => {
        this.isConnected = isConnected;
        this.calcButtonStatus();
      });
    this.vncService.isView$
      .pipe(untilDestroyed(this))
      .subscribe((isView: boolean) => {
        this.isView = isView;
        this.calcButtonStatus();
      });
  }

  onPressAltCtrlDel(): void {
    this.vncService.sendAltCtrlDel();
  }

  onPressToggleKey(name: string): void  {
    this.vncService.pressToggleButton(name);
  }

  onPressKey(name: string): void {
    this.vncService.pressKey(name);
  }

  getToggleStatus(button: string): boolean {
    return this.vncService.getToggleButtonStatus(button);
  }

  private calcButtonStatus(): void {
    this.isDisabled = !this.isConnected || this.isView;
  }
}
