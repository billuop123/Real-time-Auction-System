import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserDetails {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  auctionItems: {
    id: number;
    name: string;
    startingPrice: number;
    deadline: string;
    status: string;
    approvalStatus: string;
  }[];
  bids: {
    id: number;
    price: number;
    auction: {
      id: number;
      name: string;
      status: string;
    };
  }[];
}

export const AdminUserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/v1/admin/users/${userId}`,{
         
        });
        setUser(response.data.user);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user details');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {user.photo ? (
              <img 
                src={user.photo} 
                alt={user.name} 
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle>{user.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-slate-600">{user.email}</span>
                {user.isVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
                <Badge className="bg-blue-100 text-blue-800">
                  {user.role}
                </Badge>
              </div>
              <div className="text-slate-500 mt-1">
                Joined {format(new Date(user.createdAt), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auction Items</CardTitle>
        </CardHeader>
        <CardContent>
          {user.auctionItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.auctionItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.startingPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={
                        item.status === 'SOLD' ? 'bg-green-100 text-green-800' :
                        item.status === 'UNSOLD' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        item.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        item.approvalStatus === 'DISAPPROVED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {item.approvalStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-4">No auction items found</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {user.bids.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Auction Item</TableHead>
                  <TableHead className="text-right">Bid Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.bids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="text-left font-medium">{bid.auction.name}</TableCell>
                    <TableCell className="text-right font-medium">${bid.price.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={
                          bid.auction.status === 'SOLD' ? 'bg-green-50 text-green-700 border-green-200' :
                          bid.auction.status === 'UNSOLD' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {bid.auction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-4">No bids found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetails; 
