import Link from 'next/link';
import Image from 'next/image';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  return (
    <section className="flex-center h-screen w-full bg-gradient-to-b from-lavender-300 via-white to-yellow-200">
      <Card className="w-full max-w-[520px] border-none bg-[#5a189a] p-6 py-9 text-white shadow-xl rounded-xl">
        <CardContent>
          <div className="flex flex-col gap-9">
            <div className="flex flex-col gap-3.5">
              {iconUrl && (
                <div className="flex-center">
                  <Image src={iconUrl} width={72} height={72} alt="icon" />
                </div>
              )}
              <p className="text-center text-2xl font-bold text-yellow-300">{title}</p>
            </div>
  
            <Button asChild className="bg-yellow-500 hover:bg-yellow-400 text-[#5a189a] font-semibold">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};  
export default Alert;
