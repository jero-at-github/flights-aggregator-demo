import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class Slice {
    @ApiPropertyOptional({ type: String })
    id?: string;
    @ApiProperty({ type: String })
    origin_name: string;
    @ApiProperty({ type: String })
    destination_name: string;
    @ApiProperty({ type: String, format: 'date-time' })
    departure_date_time_utc: Date;
    @ApiProperty({ type: String, format: 'date-time' })
    arrival_date_time_utc: Date;
    @ApiProperty({ type: String })
    flight_number: string;
    @ApiPropertyOptional({ type: Number })
    duration: number;
}

export class Flight {    
    @ApiProperty({ type: Slice, isArray: true })
    slices: Slice[];
    @ApiProperty({ type: Number })
    price: number;
}

export class Flights {
    @ApiProperty({ type: Flight, isArray: true })
    flights : Flight[];
}
