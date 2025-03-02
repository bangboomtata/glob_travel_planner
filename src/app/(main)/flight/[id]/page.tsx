// import { Calendar, Clock, Luggage, MapPin, Plane } from "lucide-react"
// import { format, parseISO } from "date-fns"

// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Separator } from "@/components/ui/separator"

// export default function FlightDetails() {
//   // Helper function to format duration from ISO format
//   const formatDuration = (isoDuration: string) => {
//     const hourMatch = isoDuration.match(/PT(\d+)H/)
//     const minuteMatch = isoDuration.match(/(\d+)M/)

//     const hours = hourMatch ? Number.parseInt(hourMatch[1]) : 0
//     const minutes = minuteMatch ? Number.parseInt(minuteMatch[1]) : 0

//     return `${hours}h ${minutes}m`
//   }

//   // Helper function to get airline name from code
//   const getAirlineName = (code: string) => {
//     const airlines: Record<string, string> = {
//       AZ: "Alitalia",
//     }
//     return airlines[code] || code
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <Card className="mb-6">
//         <CardHeader className="bg-primary/5">
//           <div className="flex justify-between items-center">
//             <CardTitle className="text-xl font-bold">Flight Offer</CardTitle>
//             <Badge variant="outline" className="text-sm font-medium">
//               {flightData.travelerPricings[0].fareDetailsBySegment[0].brandedFareLabel}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="pt-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-lg font-semibold">
//                 {getAirlineName(flightData.itineraries[0].segments[0].carrierCode)}
//               </h3>
//               <p className="text-muted-foreground text-sm">
//                 {flightData.itineraries[0].segments[0].carrierCode}
//                 {flightData.itineraries[0].segments[0].number} /{flightData.itineraries[1].segments[0].carrierCode}
//                 {flightData.itineraries[1].segments[0].number}
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-bold">
//                 {flightData.price.currency} {flightData.price.total}
//               </p>
//               <p className="text-sm text-muted-foreground">{flightData.numberOfBookableSeats} seats available</p>
//             </div>
//           </div>

//           {/* Outbound Flight */}
//           <div className="mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Calendar className="h-4 w-4 text-primary" />
//               <h3 className="font-semibold">Outbound Flight</h3>
//               <span className="text-sm text-muted-foreground">
//                 {format(parseISO(flightData.itineraries[0].segments[0].departure.at), "EEE, MMM d, yyyy")}
//               </span>
//             </div>

//             <div className="flex items-start gap-4">
//               <div className="flex flex-col items-center">
//                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                   <Plane className="h-4 w-4 text-primary" />
//                 </div>
//                 <div className="h-full border-l border-dashed border-muted-foreground/30 mx-auto my-1" />
//                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                   <MapPin className="h-4 w-4 text-primary" />
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="mb-6">
//                   <div className="flex justify-between">
//                     <div>
//                       <p className="font-bold text-lg">
//                         {format(parseISO(flightData.itineraries[0].segments[0].departure.at), "HH:mm")}
//                       </p>
//                       <p className="text-sm font-medium">{flightData.itineraries[0].segments[0].departure.iataCode}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-muted-foreground" />
//                       <span className="text-sm text-muted-foreground">
//                         {formatDuration(flightData.itineraries[0].segments[0].duration)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between">
//                     <div>
//                       <p className="font-bold text-lg">
//                         {format(parseISO(flightData.itineraries[0].segments[0].arrival.at), "HH:mm")}
//                       </p>
//                       <p className="text-sm font-medium">
//                         {flightData.itineraries[0].segments[0].arrival.iataCode}
//                         {"terminal" in flightData.itineraries[0].segments[0].arrival ? 
//                           ` (Terminal ${flightData.itineraries[0].segments[0].arrival.terminal})` : ""}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <Separator className="my-6" />

//           {/* Return Flight */}
//           <div className="mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Calendar className="h-4 w-4 text-primary" />
//               <h3 className="font-semibold">Return Flight</h3>
//               <span className="text-sm text-muted-foreground">
//                 {format(parseISO(flightData.itineraries[1].segments[0].departure.at), "EEE, MMM d, yyyy")}
//               </span>
//             </div>

//             <div className="flex items-start gap-4">
//               <div className="flex flex-col items-center">
//                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                   <Plane className="h-4 w-4 text-primary" />
//                 </div>
//                 <div className="h-full border-l border-dashed border-muted-foreground/30 mx-auto my-1" />
//                 <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                   <MapPin className="h-4 w-4 text-primary" />
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="mb-6">
//                   <div className="flex justify-between">
//                     <div>
//                       <p className="font-bold text-lg">
//                         {format(parseISO(flightData.itineraries[1].segments[0].departure.at), "HH:mm")}
//                       </p>
//                       <p className="text-sm font-medium">
//                         {flightData.itineraries[1].segments[0].departure.iataCode}
//                         {"terminal" in flightData.itineraries[1].segments[0].departure ? 
//                           ` (Terminal ${flightData.itineraries[1].segments[0].departure.terminal})` : ""}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-muted-foreground" />
//                       <span className="text-sm text-muted-foreground">
//                         {formatDuration(flightData.itineraries[1].segments[0].duration)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between">
//                     <div>
//                       <p className="font-bold text-lg">
//                         {format(parseISO(flightData.itineraries[1].segments[0].arrival.at), "HH:mm")}
//                       </p>
//                       <p className="text-sm font-medium">{flightData.itineraries[1].segments[0].arrival.iataCode}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Fare Details Card */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg">Fare Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-start gap-4">
//               <Luggage className="h-5 w-5 text-muted-foreground mt-0.5" />
//               <div>
//                 <p className="font-medium">Baggage Allowance</p>
//                 <p className="text-sm text-muted-foreground">
//                   Checked bags: {flightData.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags.quantity}
//                   (Additional bags are chargeable)
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <p className="font-medium">Included Amenities</p>
//               <ul className="text-sm text-muted-foreground space-y-1">
//                 {flightData.travelerPricings[0].fareDetailsBySegment[0].amenities.map((amenity, index) => (
//                   <li key={index} className="flex items-center gap-2">
//                     <span className={amenity.isChargeable ? "text-destructive" : "text-primary"}>
//                       {amenity.isChargeable ? "✗" : "✓"}
//                     </span>
//                     <span>{amenity.description}</span>
//                     {amenity.isChargeable && <span className="text-xs">(Extra charge)</span>}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

