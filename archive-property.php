
<?php get_header(); ?>
<?php $sold = strpos($_SERVER['REQUEST_URI'], 'var=2'); //Is this a list of sold properties? T/F ?>
<script>
    //Set default user coordinates to LA office
    var user_lat = 33.901506;
    var user_lng = -118.392137;
</script>
<link href="<?php echo get_stylesheet_directory_uri() . '/js/selectric/selectric.css' ?>" rel="stylesheet" />
<?php the_post(); ?>
<?php get_template_part( 'parts/header-archive' ); ?>
<div id="page">
    <div class="filter">
        <div class="clear"></div>
        <div id="sortingControls">
            <!-- Populate sorting controls with taxonomy terms -->
            <div class="column">
                <div class="label">View</div>
                <select id="tenancyType" class="updateTrigger">
                    <option value="null">All</option>
                    <?php
                    $tenancyTypes = get_terms( 'tenancy_type', array(
                        'hide_empty' => 1,
                        ));
                        foreach ( $tenancyTypes as $tenancyType ) {?>
                        <option value="<?php echo $tenancyType->slug; ?>"><?php echo $tenancyType->name; ?></option>
                        <?php } ?>
                    </select>
                </div>
                <div class="column">
                 <div class="label">Property Type</div>
                 <select id="propertyType" class="updateTrigger">
                    <option value="null">All</option>
                    <?php
                            // Show Retail
                    $propertyTypes = get_terms( 'property_type', array(
                        'hide_empty' => 1,
                        'include'    => 18
                        ));
                        foreach ( $propertyTypes as $propertyType ) {?>
                        <option value="<?php echo $propertyType->slug; ?>"><?php echo $propertyType->name; ?></option>
                        <?php } ?>
                        <?php
                            // Show everything BUT Retail
                        $propertyTypes = get_terms( 'property_type', array(
                            'hide_empty' => 1,
                            'exclude'    => 18
                            ));
                            foreach ( $propertyTypes as $propertyType ) {?>
                            <option value="<?php echo $propertyType->slug; ?>"><?php echo $propertyType->name; ?></option>
                            <?php } ?>
                        </select>
                    </div>
                    <div class="column">
                        <div class="label">Sort By</div>
                        <select id="sortBy" class="updateTrigger">
                            <!-- <option value="status" selected="selected">Status</option> -->
                            <option value="tenant_asc">Tenant</option><!--ASC-->
                            <!-- <option value="tenant_desc">Tenant</option>--><!--DESC-->
                            <option value="date">Most Recent</option><!--DESC-->
                            <?php if ( !$sold ) { ?>
                            <option value="price_down">Price</option><!--DESC-->
                            <!-- <option value="price_up">Price</option> --><!--ASC-->
                            <option value="cap_up">Cap Rate</option><!--ASC-->
                            <!-- <option value="cap_down">Cap Rate (high to low)</option> --><!--DESC-->
                            <?php } ?>
                             <option value="near">Near Me</option><!--DESC-->
                            <option value="state">State</option><!--ASC-->
                            <?php if ( get_theme_mod('enable_views') &&
                            !$sold ) { ?>
                            <option value="views">Popularity</option><!--DESC-->
                            <?php } ?>
                        </select>
                    </div>
                    <div class="clear"></div>
                </div>
            </div>
            <section class="dark">
                <div id="properties" class="inner-width">
                    <div class="inner-content">
                        <div class="tabs right hidden"><!--Needs to be here for filtering to work-->
                            <a id="available" class="active">On Market</a>
                            <a id="pending">Sale Pending</a>
                            <a id="sold">Sold</a>
                        </div>
                        <div class="clear"></div>

                        <section class="dark">
                            <div id="properties" class="inner-width">
                                <div class="inner-content">
                                    <div id="noResultsMsg">
                                        <h2>No Results</h2>
                                        <p>Currently there are no listings to display for the selected sorting.</p>
                                    </div>
                                    <div id="propertyList"></div>
                                    <div class="clear"></div>
                                    <div id="paginationControls"></div>
                                </div><!-- end .inner-content -->
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </div><!-- end #page -->
        <script type="text/javascript">
            <?php
            $args = array(
                'post_type' => 'property',
                'meta_key' => 'status',
                'orderby' => array( /*'title' => 'ASC',*/ 'meta_value' => 'ASC'),
                'posts_per_page' => -1
                );
            echo 'var listingDb = { listings:[';

            $posts = get_posts( $args );
            $isFirst = true;
            foreach ( $posts as $post ) {
                setup_postdata( $post );

                $property_tenancy = wp_get_post_terms($post->ID, 'tenancy_type', array("fields" => "slugs"));
                $property_types = wp_get_post_terms($post->ID, 'property_type', array("fields" => "slugs"));

                $property_title = '';
        // if(get_field('listing_name') != '') {
        //     $property_title = get_field('listing_name');
        // }
        // else {
                $property_title = get_the_title();
        // }

                $property_price = str_replace(',', '', get_field('price'));
                $property_cap_rate = get_field('cap_rate');
                $property_city = get_post_meta(get_the_ID(),'city', true);
                $property_state =  get_post_meta(get_the_ID(),'state', true);
                $property_date = get_the_date('Y/m/d g:i:s');
                        $property_lat = get_field('lat');
                        $property_lng = get_field('lng');
                $statusField = get_field_object('status');
                $property_status = get_field('status');
                $property_status_label = $statusField['choices'][ $property_status ];

                $property_permalink = ( !$sold ? get_the_permalink() : 'javascript:void(0);');
        $property_thumbnail = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'property' );
        $property_thumbnail = $property_thumbnail[0];
        $views_count = get_field('post_views_count');
        if($views_count == null)
            $views_count = 0;

        //Output JSON with meta data for each property post

        if(!$isFirst) echo ","; else $isFirst = false;
        echo '{';
        echo '  "title":"' . $property_title . '",';
        echo '  "price":"' . ( !$sold ? $property_price : '' ) . '",';
        echo '  "capRate":"' . ( !$sold && $property_cap_rate > 0 ? floatval($property_cap_rate) : '' ) . '",';
        echo '  "city":"' . $property_city . '",';
        echo '  "state":"' . $property_state . '",';
        echo '  "date":"' . $property_date . '",';
        echo '  "latitude":"' . $property_lat . '",';
        echo '  "longitude":"' . $property_lng . '",';
        echo '  "statusLabel":"' . $property_status_label . '",';
        echo '  "statusValue":"' . $property_status . '",';
        echo '  "permalink":"' . $property_permalink . '",';
        echo '  "thumbnail":"' . $property_thumbnail . '",';
        echo '  "views":"' . ( ( get_theme_mod('enable_views') == 1 ) && !$sold ? $views_count * 3 : '') . '",';
        echo '  "tenancyTypes":[';
        for($i = 0; $i < count($property_tenancy); $i++){
            if($i >= 1){
                echo ",";
            }
            echo '"' . $property_tenancy[0] . '"';
        }
        echo '],';
        echo '  "propertyTypes":[';
        for($i = 0; $i < count($property_types); $i++){
            if($i >= 1){
                echo ",";
            }
            echo '"' . $property_types[$i] . '"';
        }
        echo ']';
        echo '}';
    } //foreach listing
    echo '], tenancyTypes: [';
    $isFirst = true;
    foreach ( $tenancyTypes as $tenancyType ) {
        if(!$isFirst) echo ","; else $isFirst = false;
        echo '"';
        echo $tenancyType->slug;
        echo '"';
    }
    echo '], propertyTypes: [';
    $isFirst = true;
    foreach ( $propertyTypes as $propertyType ) {
        if(!$isFirst) echo ","; else $isFirst = false;
        echo '"';
        echo $propertyType->slug;
        echo '"';
    }
    echo ']}';
    ?>
    <?php wp_reset_postdata(); ?>

    <?php
    if(isset($_GET['var'])){
        $tab = $_GET['var'];
    }
    else {
        $tab = 0;
    }
    ?>
    var selectedTab = <?php echo $tab ?>;

    jQuery(function($){
        $(".updateTrigger").change(update);
        $('#sortBy').change(function(){
            if ( $('#sortBy').val() == 'near' ) {
                function GetLocation(location) {
                    var user_lat = location.coords.latitude;
                    var user_lng = location.coords.longitude;
                    update();
                }
                navigator.geolocation.getCurrentPosition(GetLocation);
            }
        });


        $('.tabs a').removeClass('active');
        if(selectedTab == 2){
            $("#sold").addClass('active');
        }
        else{
            $("#available").addClass('active');
        }

        $("#available, #sold").click(function() {
            if(!$(this).hasClass('active')){
                $('.tabs a').removeClass('active');
                $(this).addClass('active');
            }
            update();
        })

        $('#propertyList').inventoryList(listingDb.listings);
        update();
    });

</script>
<?php get_template_part( 'js/includes-filter' ); ?>
<?php get_footer(); ?>