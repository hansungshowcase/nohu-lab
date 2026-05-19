declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar
    getLunar(): Lunar
  }

  export class Lunar {
    getYearGanIndexExact(): number
    getYearZhiIndexExact(): number
    getMonthGanIndexExact(): number
    getMonthZhiIndexExact(): number
    getDayGanIndex(): number
    getDayZhiIndex(): number
    getTimeGanIndex(): number
    getTimeZhiIndex(): number
  }
}
