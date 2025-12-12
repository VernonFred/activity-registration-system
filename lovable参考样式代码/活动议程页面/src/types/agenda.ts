export type AgendaItemType = 'speech' | 'discussion' | 'break' | 'activity';

export interface Speaker {
  name: string;
  title: string;
  avatar?: string;
}

export interface AgendaItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  type: AgendaItemType;
  title: string;
  speaker?: Speaker;
  location?: string;
}

export interface AgendaGroup {
  id: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  moderator?: Speaker;
  items: AgendaItem[];
}

export interface ConferenceDay {
  id: string;
  date: string;
  displayText: string;
  groups: AgendaGroup[];
}

export interface ConferenceData {
  title: string;
  days: ConferenceDay[];
}
