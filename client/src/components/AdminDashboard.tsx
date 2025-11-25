import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Music, Calendar, Check, X, Trash, Plus, Loader2, ShoppingBag, FileText } from "lucide-react";
import { formatDate } from "date-fns";
import { FileUpload } from "./ui/file-upload";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="mixes">Mixes</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <BookingsManager />
        </TabsContent>

        <TabsContent value="mixes">
          <MixesManager />
        </TabsContent>

        <TabsContent value="events">
          <EventsManager />
        </TabsContent>

        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>

        <TabsContent value="blog">
          <BlogManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingsManager() {
  const { data: bookings, refetch, isLoading } = trpc.bookings.adminList.useQuery();
  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking status updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">All Booking Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3 font-medium">Event</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-accent/5">
                  <td className="p-3">
                    <div className="font-semibold">{booking.eventName}</div>
                    <div className="text-xs text-muted-foreground">{booking.eventType} • {booking.eventLocation}</div>
                  </td>
                  <td className="p-3">{formatDate(new Date(booking.eventDate), 'MMM d, yyyy')}</td>
                  <td className="p-3">
                    <div className="text-sm">{booking.contactEmail}</div>
                    <div className="text-xs text-muted-foreground">{booking.contactPhone}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'confirmed' })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'cancelled' })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'completed' })}
                       >
                         Complete
                       </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MixesManager() {
  const { data: mixes, refetch } = trpc.mixes.list.useQuery();
  const createMixMutation = trpc.mixes.create.useMutation({
    onSuccess: () => {
      toast.success("Mix created successfully");
      refetch();
      // form reset handled by key change or manual reset if using controlled inputs
    },
  });
  const deleteMixMutation = trpc.mixes.delete.useMutation({
    onSuccess: () => {
      toast.success("Mix deleted");
      refetch();
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = (data: any) => {
    createMixMutation.mutate({
      ...data,
      duration: data.duration ? parseInt(data.duration) : undefined,
      isFree: true, // default for now
    });
    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-1 h-fit">
        <h3 className="font-bold text-lg mb-4">Add New Mix</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title", { required: true })} placeholder="Summer Vibes 2024" />
          </div>
          <div>
            <Label>Audio File</Label>
            <FileUpload 
              accept="audio/*"
              label="Upload MP3"
              onUploadComplete={(url) => setValue("audioUrl", url)}
            />
            <input type="hidden" {...register("audioUrl", { required: true })} />
          </div>
          <div>
            <Label>Cover Image</Label>
            <FileUpload 
              accept="image/*"
              label="Upload Cover"
              onUploadComplete={(url) => setValue("coverImageUrl", url)}
            />
            <input type="hidden" {...register("coverImageUrl")} />
          </div>
          <div>
            <Label>Genre</Label>
            <Input {...register("genre")} placeholder="House, Garage..." />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="Mix details..." />
          </div>
          <Button type="submit" className="w-full" disabled={createMixMutation.isPending}>
            {createMixMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Mix
          </Button>
        </form>
      </Card>

      <div className="md:col-span-2 space-y-4">
        {mixes?.map((mix) => (
          <Card key={mix.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {mix.coverImageUrl ? <img src={mix.coverImageUrl} className="w-full h-full object-cover" /> : <Music className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold">{mix.title}</div>
                <div className="text-sm text-muted-foreground">{mix.genre}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this mix?")) {
                  deleteMixMutation.mutate(mix.id);
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsManager() {
  const { data: events, refetch } = trpc.events.all.useQuery();
  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event created");
      refetch();
      reset();
    },
  });
  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event deleted");
      refetch();
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = (data: any) => {
    createEventMutation.mutate({
      ...data,
      isFeatured: !!data.isFeatured,
    });
    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-1 h-fit">
        <h3 className="font-bold text-lg mb-4">Add New Event</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title", { required: true })} />
          </div>
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" {...register("eventDate", { required: true })} />
          </div>
          <div>
            <Label>Location</Label>
            <Input {...register("location", { required: true })} />
          </div>
          <div>
            <Label>Event Image</Label>
            <FileUpload 
              accept="image/*"
              label="Upload Poster"
              onUploadComplete={(url) => setValue("imageUrl", url)}
            />
            <input type="hidden" {...register("imageUrl")} />
          </div>
          <div>
            <Label>Ticket URL</Label>
            <Input {...register("ticketUrl")} />
          </div>
           <div className="flex items-center gap-2">
            <Label>Featured Event?</Label>
            <Input type="checkbox" className="w-4 h-4" {...register("isFeatured")} />
          </div>
          <Button type="submit" className="w-full" disabled={createEventMutation.isPending}>
            {createEventMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Event
          </Button>
        </form>
      </Card>

      <div className="md:col-span-2 space-y-4">
        {events?.map((event) => (
          <Card key={event.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {event.imageUrl ? <img src={event.imageUrl} className="w-full h-full object-cover" /> : <Calendar className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold">{event.title}</div>
                <div className="text-sm text-muted-foreground">{formatDate(new Date(event.eventDate), 'MMM d, yyyy h:mm a')} • {event.location}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Delete this event?")) {
                  deleteEventMutation.mutate(event.id);
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductsManager() {
  const { data: products, refetch } = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Product created");
      refetch();
      reset();
    },
  });
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted");
      refetch();
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = (data: any) => {
    createProductMutation.mutate({
      ...data,
      price: parseFloat(data.price) * 100, // Convert to cents
      inStock: !!data.inStock,
    });
    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-1 h-fit">
        <h3 className="font-bold text-lg mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register("name", { required: true })} placeholder="Product Name" />
          </div>
          <div>
            <Label>Price ($)</Label>
            <Input type="number" step="0.01" {...register("price", { required: true })} placeholder="25.00" />
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category", { required: true })} placeholder="Vinyl, Merch, Digital" />
          </div>
          <div>
            <Label>Image</Label>
            <FileUpload 
              accept="image/*"
              label="Upload Product Image"
              onUploadComplete={(url) => setValue("imageUrl", url)}
            />
            <input type="hidden" {...register("imageUrl")} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} placeholder="Product details..." />
          </div>
           <div className="flex items-center gap-2">
            <Label>In Stock?</Label>
            <Input type="checkbox" className="w-4 h-4" {...register("inStock")} defaultChecked />
          </div>
          <Button type="submit" className="w-full" disabled={createProductMutation.isPending}>
            {createProductMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Product
          </Button>
        </form>
      </Card>

      <div className="md:col-span-2 space-y-4">
        {products?.map((product) => (
          <Card key={product.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold">{product.name}</div>
                <div className="text-sm text-muted-foreground">${(product.price / 100).toFixed(2)} • {product.category}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Delete this product?")) {
                  deleteProductMutation.mutate(product.id);
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BlogManager() {
  const { data: posts, refetch } = trpc.posts.list.useQuery();
  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created");
      refetch();
      reset();
    },
  });
  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetch();
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = (data: any) => {
    createPostMutation.mutate({
      ...data,
      isMembersOnly: !!data.isMembersOnly,
      published: true,
    });
    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6 md:col-span-1 h-fit">
        <h3 className="font-bold text-lg mb-4">Add New Post</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input {...register("title", { required: true })} placeholder="Post Title" />
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category")} placeholder="DJ Tips, News..." />
          </div>
          <div>
            <Label>Cover Image</Label>
            <FileUpload 
              accept="image/*"
              label="Upload Blog Image"
              onUploadComplete={(url) => setValue("imageUrl", url)}
            />
            <input type="hidden" {...register("imageUrl")} />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea {...register("excerpt")} placeholder="Short summary..." className="h-20" />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea {...register("content", { required: true })} placeholder="Full article content..." className="h-40" />
          </div>
           <div className="flex items-center gap-2">
            <Label>Members Only?</Label>
            <Input type="checkbox" className="w-4 h-4" {...register("isMembersOnly")} />
          </div>
          <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
            {createPostMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
            Publish Post
          </Button>
        </form>
      </Card>

      <div className="md:col-span-2 space-y-4">
        {posts?.map((post) => (
          <Card key={post.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover" /> : <FileText className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold">{post.title}</div>
                <div className="text-sm text-muted-foreground">{post.category} • {formatDate(new Date(post.createdAt), 'MMM d')}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Delete this post?")) {
                  deletePostMutation.mutate(post.id);
                }
              }}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
