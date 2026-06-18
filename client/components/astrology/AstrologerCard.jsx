import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Avatar } from "../ui/Avatar.jsx";
import { Badge } from "../ui/Badge.jsx";

export const AstrologerCard = ({ astrologer }) => (
  <Card className="flex h-full flex-col">
    <CardHeader className="items-start gap-4">
      <Avatar src={astrologer.avatar} name={astrologer.name} className="h-16 w-16" />
      <div>
        <CardTitle>{astrologer.name}</CardTitle>
        <CardDescription>{astrologer.description}</CardDescription>
      </div>
    </CardHeader>
    <CardContent className="flex-1 space-y-3 text-sm text-[color:var(--color-text-soft)]">
      <div className="flex flex-wrap gap-2">
        {astrologer.specialty?.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
      {(() => {
        const perMin = astrologer?.pricePerMinute ?? 100;
        return (
          <p>
            ₹{perMin}/min chat • {astrologer.languages?.join(", ") || "Multiple languages"}
          </p>
        );
      })()}
    </CardContent>
    <CardFooter className="justify-between">
      <Button as={Link} href={`/chat/${astrologer._id}`} variant="primary">
        Chat now
      </Button>
      <Button as={Link} href={`/astrologers/${astrologer._id}`} variant="outline">
        View profile
      </Button>
    </CardFooter>
  </Card>
);

