import { Component } from '@angular/core';
import { MatchHistoryComponent } from '../../match-history/presenters/match-history.component';

@Component({
  selector: 'app-loading-match-history-showcase',
  imports: [MatchHistoryComponent],
  template: `
    <app-match-history [entries]="[]" [loading]="true" [total]="0" [pageIndex]="0" [pageSize]="10"></app-match-history>
  `,
  styles: ``
})
export class LoadingMatchHistoryShowcaseComponent {}
