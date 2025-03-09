import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { viewTripHotel } from '../../action'
import { Building, MapPin, Ruler } from "lucide-react"

interface PageProps {
   params: Promise<{ hotelId: string }>
}

async function HotelDetails({ hotelId }: { hotelId: string }) {
   const hotelData = await viewTripHotel(parseInt(hotelId))
   const details = hotelData.hotelDetails

   return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                {details?.hotelName}
              </h3>
              <p className="text-muted-foreground text-sm">
                Hotel Chain: {details?.chainCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {details?.price.currency} {details?.price.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {details?.distance.value} {details?.distance.unit} from airport
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Hotel ID</p>
                <p className="text-sm text-muted-foreground">
                  {details?.hotelId}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
   )
}

export default async function HotelDetailsPage({
   params,
}: PageProps) {
   const { hotelId } = await params

   return (
      <main className="container mx-auto min-h-full max-w-3xl flex-col">
         <BackgroundGradient className="p-3">
            <Suspense fallback={<div className="text-center">Loading hotel details...</div>}>
               <HotelDetails hotelId={hotelId} />
            </Suspense>
         </BackgroundGradient>
      </main>
   )
} 