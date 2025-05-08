
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

interface SpotImageCarouselProps {
  images: string[];
  name: string;
}

const SpotImageCarousel: React.FC<SpotImageCarouselProps> = ({ images, name }) => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-0">
                  <img 
                    src={image} 
                    alt={`${name} - Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default SpotImageCarousel;
