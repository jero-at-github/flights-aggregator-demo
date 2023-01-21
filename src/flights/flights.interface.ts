export interface Slice {
    id?: string,
    origin_name: string,
    destination_name: string,
    departure_date_time_utc: Date,
    arrival_date_time_utc: Date,
    flight_number: string,
    duration: number
}

export interface Flight {
    slices: Slice[],
    price: number
}

export interface Flights {
    flights : Flight[]    
}
