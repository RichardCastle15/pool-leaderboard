import { Component } from '@angular/core';
import { LeaderboardComponent } from '../../leaderboard/leaderboard.component';

@Component({
  selector: 'app-large-leaderboard-showcase',
  imports: [LeaderboardComponent],
  template: `
    <app-leaderboard [entries]="data"></app-leaderboard>
  `,
  styles: ``
})
export class LargeLeaderboardShowcaseComponent {
  data = [
    {
      data: { id: 1, name: 'Richard', points: 1906, rank: 1 },
      children: [
        { data: { name: 'Head-To-Head', points: 1696, rank: 2 } },
        { data: { name: 'Killer', points: 210, rank: 1 } },
      ]
    },
    {
      data: { id: 2, name: 'Russel', points: 1711, rank: 2 },
      children: [
        { data: { name: 'Head-To-Head', points: 1701, rank: 1 } },
        { data: { name: 'Killer', points: 10, rank: 4 } },
      ]
    },
    {
      data: { id: 3, name: 'Stephen B', points: 1440, rank: 3 },
      children: [
        { data: { name: 'Head-To-Head', points: 1400, rank: 3 } },
        { data: { name: 'Killer', points: 40, rank: 3 } },
      ]
    },
    {
      data: { id: 4, name: 'Rob P', points: 1389, rank: 4 },
      children: [
        { data: { name: 'Head-To-Head', points: 1289, rank: 4 } },
        { data: { name: 'Killer', points: 100, rank: 2 } },
      ]
    },
    {
      data: { id: 5, name: 'Alfie', points: 1349, rank: 5 },
      children: [
        { data: { name: 'Head-To-Head', points: 1359, rank: 5 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 6, name: 'Ant', points: 1323, rank: 6 },
      children: [
        { data: { name: 'Head-To-Head', points: 1333, rank: 6 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 7, name: 'George', points: 1287, rank: 7 },
      children: [
        { data: { name: 'Head-To-Head', points: 1297, rank: 7 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 8, name: 'David B', points: 1199, rank: 8 },
      children: [
        { data: { name: 'Head-To-Head', points: 1209, rank: 8 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 9, name: 'Xenia', points: 1137, rank: 9 },
      children: [
        { data: { name: 'Head-To-Head', points: 1147, rank: 9 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 10, name: 'Stephen G', points: 1132, rank: 10 },
      children: [
        { data: { name: 'Head-To-Head', points: 1142, rank: 10 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 11, name: 'Sundeep', points: 1109, rank: 11 },
      children: [
        { data: { name: 'Head-To-Head', points: 1119, rank: 11 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 12, name: 'Warren', points: 1087, rank: 12 },
      children: [
        { data: { name: 'Head-To-Head', points: 1097, rank: 12 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 13, name: 'Brian', points: 1073, rank: 13 },
      children: [
        { data: { name: 'Head-To-Head', points: 1083, rank: 13 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 14, name: 'Chris S', points: 1069, rank: 14 },
      children: [
        { data: { name: 'Head-To-Head', points: 1079, rank: 14 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 15, name: 'Dan', points: 1067, rank: 15 },
      children: [
        { data: { name: 'Head-To-Head', points: 1077, rank: 15 } },
        { data: { name: 'Killer', points: -10, rank: 5 } },
      ]
    },
    {
      data: { id: 16, name: 'James S', points: 240, rank: 16 },
      children: [
        { data: { name: 'Head-To-Head', points: 1240, rank: 16 } },
        { data: { name: 'Killer', points: -1000, rank: 16 } },
      ]
    },
  ];
}
